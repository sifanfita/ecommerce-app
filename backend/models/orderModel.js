import { getPool } from "../config/postgres.js";

const mapOrderRow = (row) => {
  if (!row) return null;

  const parsedItems =
    row.items == null
      ? []
      : typeof row.items === "string"
      ? JSON.parse(row.items)
      : row.items;

  const parsedAddress =
    row.address == null
      ? {}
      : typeof row.address === "string"
      ? JSON.parse(row.address)
      : row.address;
  let normalizedDate = null;
  if (row.date != null) {
    if (row.date instanceof Date) {
      normalizedDate = row.date.toISOString();
    } else if (typeof row.date === "number") {
      const d = new Date(row.date);
      normalizedDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
    } else if (typeof row.date === "string") {
      // Handle legacy millisecond timestamps stored as plain digits
      if (/^\d+$/.test(row.date)) {
        const d = new Date(Number(row.date));
        normalizedDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
      } else {
        const d = new Date(row.date);
        normalizedDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
      }
    }
  }

  return {
    ...row,
    _id: String(row.id),
    userId: String(row.user_id),
    items: parsedItems,
    amount: Number(row.amount),
    address: parsedAddress,
    date: normalizedDate,
    paymentProof: row.payment_proof,
  };
};

export const createOrder = async ({
  userId,
  items,
  amount,
  address,
  paymentProof,
  status = "Order placed",
}) => {
  const pool = await getPool();

  const itemsJson = JSON.stringify(items ?? []);
  const addressJson = JSON.stringify(address ?? {});

  const { rows } = await pool.query(
    `INSERT INTO orders
      (user_id, items, amount, address, status, payment_proof)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      itemsJson,
      Number(amount) || 0,
      addressJson,
      status,
      paymentProof,
    ]
  );

  return mapOrderRow(rows[0]);
};

export const getAllOrders = async () => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM orders ORDER BY date DESC"
  );
  return rows.map(mapOrderRow);
};

export const getOrdersByUserId = async (userId) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  );
  return rows.map(mapOrderRow);
};

export const updateOrderStatusById = async (orderId, status) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, orderId]
  );
  return mapOrderRow(rows[0]);
};


const normalizeVariant = (value) =>
  String(value ?? "").trim().toLowerCase();

// Online delivery fee
const ONLINE_DELIVERY_FEE = 100;

// Create an online order and deduct stock atomically.
export const createOrderWithStock = async ({
  userId,
  items,
  address,
  paymentProof,
  status = "Order placed",
}) => {
  const pool = await getPool();
  const client = await pool.connect();

  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain at least one product");
    }

    // Validate product IDs and get unique IDs.
    const productIds = [
      ...new Set(
        items.map((item) => {
          const id = Number(item.itemId);

          if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid product ID in order");
          }

          return id;
        })
      ),
    ].sort((a, b) => a - b);

    // Lock products to prevent concurrent stock changes.
    const { rows: productRows } = await client.query(
      `SELECT *
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id
       FOR UPDATE`,
      [productIds]
    );

    const products = new Map(
      productRows.map((product) => [
        String(product.id),
        {
          ...product,
          price: Number(product.price),
          cost_price: Number(product.cost_price ?? 0),
          colors:
            typeof product.colors === "string"
              ? JSON.parse(product.colors || "[]")
              : product.colors || [],
          image:
            typeof product.image === "string"
              ? JSON.parse(product.image || "[]")
              : product.image || [],
        },
      ])
    );

    // Make sure all requested products exist.
    if (products.size !== productIds.length) {
      throw new Error("One or more products could not be found");
    }

    const orderItems = [];
    let subtotalCents = 0;

    // Validate variants, calculate prices, and deduct stock in memory.
    for (const item of items) {
      const product = products.get(String(Number(item.itemId)));

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid product quantity");
      }

      const colorData = product.colors.find(
        (color) =>
          normalizeVariant(color.color) ===
          normalizeVariant(item.color)
      );

      if (!colorData) {
        throw new Error(`Color not available for ${product.name}`);
      }

      const sizeData = colorData.sizes.find(
        (size) =>
          normalizeVariant(size.size) ===
          normalizeVariant(item.size)
      );

      if (!sizeData) {
        throw new Error(
          `Size ${item.size} not available for ${product.name}`
        );
      }

      const availableStock = Number(sizeData.stock);

      if (!Number.isFinite(availableStock) || availableStock < quantity) {
        throw new Error(
          `${product.name} (${item.size}) has insufficient stock`
        );
      }

      const sellingPrice = product.price;
      const costPrice = product.cost_price;

      if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
        throw new Error(`Invalid selling price for ${product.name}`);
      }

      if (!Number.isFinite(costPrice) || costPrice < 0) {
        throw new Error(`Invalid cost price for ${product.name}`);
      }

      // Deduct the requested quantity.
      sizeData.stock = availableStock - quantity;

      // Calculate using integer cents to avoid floating-point total errors.
      const sellingPriceCents = Math.round(sellingPrice * 100);
      subtotalCents += sellingPriceCents * quantity;

      // Save authoritative product and price snapshots.
      orderItems.push({
        itemId: product.id,
        name: product.name,
        image: product.image,
        color: colorData.color,
        size: sizeData.size,
        sku: sizeData.sku || null,
        quantity,

        // Latest database selling price.
        price: sellingPrice,
        originalPrice: sellingPrice,
        unitSellingPrice: sellingPrice,

        // Cost price at the time of this sale.
        costPrice,
      });
    }

    // Calculate final amount on the backend.
    const deliveryFeeCents = ONLINE_DELIVERY_FEE * 100;
    const totalCents = subtotalCents + deliveryFeeCents;
    const orderAmount = totalCents / 100;

    // Save updated stock for each product.
    for (const product of products.values()) {
      await client.query(
        `UPDATE products
         SET colors = $1
         WHERE id = $2`,
        [JSON.stringify(product.colors), product.id]
      );
    }

    // Create order using the server-calculated amount.
    const { rows } = await client.query(
      `INSERT INTO orders
        (user_id, items, amount, address, status, payment_proof)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        Number(userId),
        JSON.stringify(orderItems),
        orderAmount,
        JSON.stringify(address ?? {}),
        status,
        paymentProof,
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return mapOrderRow(rows[0]);
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
  }
};

// Update order status and restore stock when cancelled.
export const updateOrderStatusWithStock = async (orderId, newStatus) => {
  const pool = await getPool();
  const client = await pool.connect();

  let transactionStarted = false;

  const allowedStatuses = [
    "Order placed",
    "Processing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  try {
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error("Invalid order status");
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the order to prevent duplicate cancellation.
    const { rows: orderRows } = await client.query(
      `SELECT * FROM orders
       WHERE id = $1
       FOR UPDATE`,
      [Number(orderId)]
    );

    const order = orderRows[0];

    if (!order) {
      throw new Error("Order not found");
    }

    // Do not allow changes after cancellation.
    if (order.status === "Cancelled") {
      if (newStatus === "Cancelled") {
        await client.query("COMMIT");
        transactionStarted = false;
        return mapOrderRow(order);
      }

      throw new Error("A cancelled order cannot be changed");
    }

    if (
  ["Out for Delivery", "Delivered"].includes(order.status) &&
  newStatus === "Cancelled"
) {
  throw new Error(
    "An order cannot be cancelled after it is out for delivery"
  );
}

    // Restore stock only when cancelling for the first time.
    if (newStatus === "Cancelled") {
      const items =
        typeof order.items === "string"
          ? JSON.parse(order.items)
          : order.items || [];

      const productIds = [
        ...new Set(
          items.map((item) => {
            const id = Number(item.itemId);

            if (!Number.isInteger(id) || id <= 0) {
              throw new Error("Invalid product ID in saved order");
            }

            return id;
          })
        ),
      ].sort((a, b) => a - b);

      const { rows: productRows } = await client.query(
        `SELECT * FROM products
         WHERE id = ANY($1::int[])
         ORDER BY id
         FOR UPDATE`,
        [productIds]
      );

      const products = new Map(
        productRows.map((product) => [
          String(product.id),
          {
            ...product,
            colors:
              typeof product.colors === "string"
                ? JSON.parse(product.colors || "[]")
                : product.colors || [],
          },
        ])
      );

      for (const item of items) {
        const product = products.get(String(Number(item.itemId)));

        if (!product) {
          throw new Error(
            `Cannot restore stock: product ${item.itemId} was not found`
          );
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Invalid quantity in saved order");
        }

        const colorData = product.colors.find(
          (color) =>
            normalizeVariant(color.color) ===
            normalizeVariant(item.color)
        );

        if (!colorData) {
          throw new Error(
            `Cannot restore stock: color ${item.color} was not found`
          );
        }

        const sizeData = colorData.sizes.find(
          (size) =>
            normalizeVariant(size.size) ===
            normalizeVariant(item.size)
        );

        if (!sizeData) {
          throw new Error(
            `Cannot restore stock: size ${item.size} was not found`
          );
        }

        sizeData.stock = Number(sizeData.stock) + quantity;
      }

      for (const product of products.values()) {
        await client.query(
          `UPDATE products
           SET colors = $1
           WHERE id = $2`,
          [JSON.stringify(product.colors), product.id]
        );
      }
    }

    const { rows: updatedRows } = await client.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [newStatus, Number(orderId)]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return mapOrderRow(updatedRows[0]);
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
  }
};


// Safely parse product colors from PostgreSQL
const parsePOSColors = (value) => {
  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value ?? [];
};

// Normalize variant names for matching
const normalizePOSValue = (value) =>
  String(value ?? "").trim().toLowerCase();

// =======================
// POS – CREATE IN-PERSON SALE
// =======================
export const createPOSSale = async ({ sellerId, items }) => {
  const pool = await getPool();
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    if (!sellerId || !Number.isInteger(Number(sellerId))) {
      throw new Error("Invalid seller ID");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Sale must contain at least one product");
    }

    await client.query("BEGIN");
    transactionStarted = true;
    // Get unique product IDs and lock them in a consistent order.
    const productIds = [
      ...new Set(
        items.map((item) => Number(item.productId ?? item.itemId))
      ),
    ].sort((a, b) => a - b);

    if (
      productIds.some(
        (id) => !Number.isInteger(id) || id <= 0
      )
    ) {
      throw new Error("Invalid product ID");
    }

    const { rows: products } = await client.query(
      `SELECT id, name, price, cost_price, colors
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id
       FOR UPDATE`,
      [productIds]
    );

    const productMap = new Map();

    for (const product of products) {
      productMap.set(Number(product.id), {
        ...product,
        price: Number(product.price),
        cost_price: Number(product.cost_price ?? 0),
        colors: parsePOSColors(product.colors),
      });
    }

    if (productMap.size !== productIds.length) {
      throw new Error("One or more products could not be found");
    }

    const saleItems = [];
    let totalAmount = 0;

    // Validate products, variants, prices, and stock.
    for (const item of items) {
      const productId = Number(item.productId ?? item.itemId);
      const product = productMap.get(productId);

      const quantity = Number(item.quantity);
      const unitSellingPrice = Number(
        item.unitSellingPrice ?? item.sellingPrice
      );

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for ${product.name}`);
      }

      if (
        !Number.isFinite(unitSellingPrice) ||
        unitSellingPrice <= 0
      ) {
        throw new Error(`Invalid selling price for ${product.name}`);
      }

      const costPrice = product.cost_price;
      const originalPrice = product.price;

      if (unitSellingPrice < costPrice) {
        throw new Error(
          `Selling price for ${product.name} cannot be below its cost price (${costPrice} ETB)`
        );
      }

      const colorEntry = product.colors.find(
        (color) =>
          normalizePOSValue(color.color) ===
          normalizePOSValue(item.color)
      );

      if (!colorEntry) {
        throw new Error(
          `Color ${item.color} is unavailable for ${product.name}`
        );
      }

      const sizeEntry = (colorEntry.sizes || []).find(
        (size) =>
          normalizePOSValue(size.size) ===
          normalizePOSValue(item.size)
      );

      if (!sizeEntry) {
        throw new Error(
          `Size ${item.size} is unavailable for ${product.name}`
        );
      }

      const availableStock = Number(sizeEntry.stock);

      if (availableStock < quantity) {
        throw new Error(
          `Insufficient stock for ${product.name} (${item.color}, ${item.size}). Available: ${availableStock}`
        );
      }

      // Deduct stock in memory. It will be saved inside this transaction.
      sizeEntry.stock = availableStock - quantity;

      const lineTotal = quantity * unitSellingPrice;
      totalAmount += lineTotal;

      saleItems.push({
        productId,
        productName: product.name,
        sku: sizeEntry.sku || null,
        color: colorEntry.color,
        size: sizeEntry.size,
        quantity,
        costPrice,
        originalPrice,
        unitSellingPrice,
      });
    }

    // Save updated stock for each product.
    for (const productId of productIds) {
      const product = productMap.get(productId);

      await client.query(
        `UPDATE products
         SET colors = $1
         WHERE id = $2`,
        [JSON.stringify(product.colors), productId]
      );
    }

    // Create the POS sale.
    const { rows: saleRows } = await client.query(
      `INSERT INTO pos_sales
         (seller_id, total_amount)
       VALUES ($1, $2)
       RETURNING *`,
      [Number(sellerId), totalAmount]
    );

    const sale = saleRows[0];

    // Save individual sale items.
    for (const item of saleItems) {
      await client.query(
        `INSERT INTO pos_sale_items (
           sale_id,
           product_id,
           product_name,
           sku,
           color,
           size,
           quantity,
           cost_price,
           original_price,
           unit_selling_price
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          sale.id,
          item.productId,
          item.productName,
          item.sku,
          item.color,
          item.size,
          item.quantity,
          item.costPrice,
          item.originalPrice,
          item.unitSellingPrice,
        ]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      ...sale,
      total_amount: Number(sale.total_amount),
      items: saleItems,
    };
  } catch (error) {
  if (transactionStarted) {
    await client.query("ROLLBACK");
  }

  throw error;
} finally {
  client.release();
}
};


export const getSalesHistory = async ({
  startDate = null,
  endDate = null,
  type = "All",
}) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `
    WITH online_sales AS (
      SELECT
        o.id,
        'Online'::text AS sale_type,
        o.date,
        o.user_id AS reference_user_id,
        o.amount AS total_amount,

        CASE
          WHEN jsonb_array_length(o.items) > 0
           AND NOT EXISTS (
             SELECT 1
             FROM jsonb_array_elements(o.items) AS item
             WHERE
               NULLIF(item.value->>'costPrice', '') IS NULL
               OR NULLIF(item.value->>'unitSellingPrice', '') IS NULL
           )
          THEN (
            SELECT SUM(
              (item.value->>'quantity')::numeric *
              (
                (item.value->>'unitSellingPrice')::numeric -
                (item.value->>'costPrice')::numeric
              )
            )
            FROM jsonb_array_elements(o.items) AS item
          )
          ELSE NULL
        END AS profit,

        CASE
          WHEN jsonb_array_length(o.items) > 0
           AND NOT EXISTS (
             SELECT 1
             FROM jsonb_array_elements(o.items) AS item
             WHERE
               NULLIF(item.value->>'costPrice', '') IS NULL
               OR NULLIF(item.value->>'unitSellingPrice', '') IS NULL
           )
          THEN TRUE
          ELSE FALSE
        END AS profit_available,

        o.items

      FROM orders o
      WHERE o.status IN (
        'Processing',
        'Out for Delivery',
        'Delivered'
      )
    ),

    pos_sales AS (
      SELECT
        ps.id,
        'POS'::text AS sale_type,
        ps.date,
        ps.seller_id AS reference_user_id,
        ps.total_amount,

        SUM(
          psi.quantity *
          (psi.unit_selling_price - psi.cost_price)
        ) AS profit,

        TRUE AS profit_available,

        jsonb_agg(
          jsonb_build_object(
            'productId', psi.product_id,
            'productName', psi.product_name,
            'sku', psi.sku,
            'color', psi.color,
            'size', psi.size,
            'quantity', psi.quantity,
            'costPrice', psi.cost_price,
            'originalPrice', psi.original_price,
            'unitSellingPrice', psi.unit_selling_price
          )
          ORDER BY psi.id
        ) AS items

      FROM pos_sales ps
      INNER JOIN pos_sale_items psi
        ON psi.sale_id = ps.id
      GROUP BY
        ps.id,
        ps.seller_id,
        ps.total_amount,
        ps.date
    ),

    all_sales AS (
      SELECT * FROM online_sales
      UNION ALL
      SELECT * FROM pos_sales
    )

    SELECT *
    FROM all_sales
    WHERE
      ($1::date IS NULL OR date >= $1::date)
      AND
      ($2::date IS NULL OR date < ($2::date + INTERVAL '1 day'))
      AND
      ($3 = 'All' OR sale_type = $3)
    ORDER BY date DESC, id DESC
    `,
    [startDate, endDate, type]
  );

  const sales = rows.map((sale) => ({
    ...sale,
    id: Number(sale.id),
    reference_user_id: Number(sale.reference_user_id),
    total_amount: Number(sale.total_amount),
    profit: sale.profit == null ? null : Number(sale.profit),
    profit_available: sale.profit_available,
    items:
      typeof sale.items === "string"
        ? JSON.parse(sale.items)
        : sale.items,
  }));

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + sale.total_amount,
    0
  );

  const knownProfitSales = sales.filter(
    (sale) => sale.profit_available
  );

  const totalProfit = knownProfitSales.reduce(
    (sum, sale) => sum + sale.profit,
    0
  );

  return {
    sales,
    summary: {
      totalRevenue,
      totalProfit,
      onlineSalesCount: sales.filter(
        (sale) => sale.sale_type === "Online"
      ).length,
      posSalesCount: sales.filter(
        (sale) => sale.sale_type === "POS"
      ).length,
      totalSalesCount: sales.length,
      profitAvailableCount: knownProfitSales.length,
      profitUnavailableCount:
        sales.length - knownProfitSales.length,
    },
  };
};

// =======================
// DASHBOARD – SALES ANALYTICS
// =======================
export const getSalesAnalytics = async ({
  startDate,
  endDate,
  groupBy = "day",
}) => {
  const pool = await getPool();

  // Only allow supported grouping intervals.
  const allowedGroups = ["day", "week", "month"];

  if (!allowedGroups.includes(groupBy)) {
    throw new Error("Invalid analytics grouping");
  }

  const { rows } = await pool.query(
    `
    WITH online_sales AS (
      SELECT
        o.id,
        'Online'::text AS sale_type,
        o.date AS sale_date,
        o.amount AS total_amount,

        CASE
          WHEN jsonb_array_length(o.items) > 0
           AND NOT EXISTS (
             SELECT 1
             FROM jsonb_array_elements(o.items) AS item
             WHERE
               NULLIF(item.value->>'costPrice', '') IS NULL
               OR NULLIF(item.value->>'unitSellingPrice', '') IS NULL
           )
          THEN (
            SELECT SUM(
              (item.value->>'quantity')::numeric *
              (
                (item.value->>'unitSellingPrice')::numeric -
                (item.value->>'costPrice')::numeric
              )
            )
            FROM jsonb_array_elements(o.items) AS item
          )
          ELSE NULL
        END AS profit,

        CASE
          WHEN jsonb_array_length(o.items) > 0
           AND NOT EXISTS (
             SELECT 1
             FROM jsonb_array_elements(o.items) AS item
             WHERE
               NULLIF(item.value->>'costPrice', '') IS NULL
               OR NULLIF(item.value->>'unitSellingPrice', '') IS NULL
           )
          THEN TRUE
          ELSE FALSE
        END AS profit_available

      FROM orders o

      WHERE o.status IN (
        'Processing',
        'Out for Delivery',
        'Delivered'
      )
      AND o.date >= $1::date
      AND o.date < ($2::date + INTERVAL '1 day')
    ),

    pos_sales AS (
      SELECT
        ps.id,
        'POS'::text AS sale_type,
        ps.date AS sale_date,
        ps.total_amount,

        SUM(
          psi.quantity *
          (psi.unit_selling_price - psi.cost_price)
        ) AS profit,

        TRUE AS profit_available

      FROM pos_sales ps

      INNER JOIN pos_sale_items psi
        ON psi.sale_id = ps.id

      WHERE ps.date >= $1::date
        AND ps.date < ($2::date + INTERVAL '1 day')

      GROUP BY
        ps.id,
        ps.date,
        ps.total_amount
    ),

    all_sales AS (
      SELECT * FROM online_sales

      UNION ALL

      SELECT * FROM pos_sales
    ),

    date_series AS (
      SELECT generate_series(
        DATE_TRUNC($3, $1::date::timestamp),
        DATE_TRUNC($3, $2::date::timestamp),
        CASE $3
          WHEN 'day' THEN INTERVAL '1 day'
          WHEN 'week' THEN INTERVAL '1 week'
          WHEN 'month' THEN INTERVAL '1 month'
        END
      ) AS period
    ),

    period_sales AS (
      SELECT
        DATE_TRUNC($3, sale_date) AS period,

        SUM(total_amount) AS revenue,

        SUM(profit) AS profit,

        SUM(
          CASE WHEN sale_type = 'Online'
          THEN total_amount ELSE 0 END
        ) AS online_revenue,

        SUM(
          CASE WHEN sale_type = 'POS'
          THEN total_amount ELSE 0 END
        ) AS pos_revenue,

        COUNT(*) AS sales_count,

        COUNT(*) FILTER (
          WHERE sale_type = 'Online'
        ) AS online_sales_count,

        COUNT(*) FILTER (
          WHERE sale_type = 'POS'
        ) AS pos_sales_count,

        COUNT(*) FILTER (
          WHERE profit_available = TRUE
        ) AS profit_available_count,

        COUNT(*) FILTER (
          WHERE profit_available = FALSE
        ) AS profit_unavailable_count

      FROM all_sales

      GROUP BY DATE_TRUNC($3, sale_date)
    ),

    chart_data AS (
      SELECT
        ds.period,

        COALESCE(ps.revenue, 0) AS revenue,

        ps.profit,

        COALESCE(ps.online_revenue, 0) AS online_revenue,

        COALESCE(ps.pos_revenue, 0) AS pos_revenue,

        COALESCE(ps.sales_count, 0) AS sales_count,

        COALESCE(ps.online_sales_count, 0) AS online_sales_count,

        COALESCE(ps.pos_sales_count, 0) AS pos_sales_count,

        COALESCE(ps.profit_available_count, 0)
          AS profit_available_count,

        COALESCE(ps.profit_unavailable_count, 0)
          AS profit_unavailable_count

      FROM date_series ds

      LEFT JOIN period_sales ps
        ON ps.period = ds.period
    ),

    summary AS (
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,

        SUM(profit) AS total_profit,

        COUNT(*) AS total_sales_count,

        COUNT(*) FILTER (
          WHERE sale_type = 'Online'
        ) AS online_sales_count,

        COUNT(*) FILTER (
          WHERE sale_type = 'POS'
        ) AS pos_sales_count,

        COALESCE(
          SUM(total_amount) FILTER (
            WHERE sale_type = 'Online'
          ), 0
        ) AS online_revenue,

        COALESCE(
          SUM(total_amount) FILTER (
            WHERE sale_type = 'POS'
          ), 0
        ) AS pos_revenue,

        COUNT(*) FILTER (
          WHERE profit_available = TRUE
        ) AS profit_available_count,

        COUNT(*) FILTER (
          WHERE profit_available = FALSE
        ) AS profit_unavailable_count

      FROM all_sales
    )

    SELECT
      cd.*,

      s.total_revenue,
      s.total_profit,
      s.total_sales_count,
      s.online_sales_count AS summary_online_sales_count,
      s.pos_sales_count AS summary_pos_sales_count,
      s.online_revenue AS summary_online_revenue,
      s.pos_revenue AS summary_pos_revenue,
      s.profit_available_count AS summary_profit_available_count,
      s.profit_unavailable_count AS summary_profit_unavailable_count

    FROM chart_data cd

    CROSS JOIN summary s

    ORDER BY cd.period ASC
    `,
    [startDate, endDate, groupBy]
  );

  const chart = rows.map((row) => ({
    period: row.period,
    revenue: Number(row.revenue),
    profit:
      row.profit == null ? null : Number(row.profit),

    onlineRevenue: Number(row.online_revenue),
    posRevenue: Number(row.pos_revenue),

    salesCount: Number(row.sales_count),
    onlineSalesCount: Number(row.online_sales_count),
    posSalesCount: Number(row.pos_sales_count),

    profitAvailableCount: Number(row.profit_available_count),
    profitUnavailableCount: Number(row.profit_unavailable_count),
  }));

  const firstRow = rows[0];

  return {
    chart,

    summary: {
      totalRevenue: Number(firstRow.total_revenue),

      totalProfit:
        firstRow.total_profit == null
          ? null
          : Number(firstRow.total_profit),

      totalSalesCount: Number(firstRow.total_sales_count),

      onlineRevenue: Number(firstRow.summary_online_revenue),
      posRevenue: Number(firstRow.summary_pos_revenue),

      onlineSalesCount: Number(firstRow.summary_online_sales_count),
      posSalesCount: Number(firstRow.summary_pos_sales_count),

      profitAvailableCount: Number(
        firstRow.summary_profit_available_count
      ),

      profitUnavailableCount: Number(
        firstRow.summary_profit_unavailable_count
      ),
    },

    filters: {
      startDate,
      endDate,
      groupBy,
    },
  };
};



