
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

import { MaterialReactTable } from "material-react-table";
import {
  Box,
  TextField,
  Chip,
  Button,
  Typography,
  Alert,
  Stack,
  Divider,
} from "@mui/material";

const LOW_STOCK_THRESHOLD = 5;

const getStockStatus = (stock) => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "In Stock";
};

const getStatusColor = (status) => {
  if (status === "Out of Stock") return "error";
  if (status === "Low Stock") return "warning";
  return "success";
};

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [draftStock, setDraftStock] = useState({});
  const [restockDraft, setRestockDraft] = useState({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [restocking, setRestocking] = useState({});

  const fetchList = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        backendUrl + "/api/product/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Create a unique key for each product variant.
  const getVariantKey = (productId, color, size) =>
    `${productId}-${color}-${size}`;

  const handleStockChange = (key, value) => {
    setDraftStock((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRestockChange = (key, field, value) => {
    setRestockDraft((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Set an exact stock quantity (manual correction).
  const updateStock = async (
    productId,
    color,
    size,
    currentStock,
    key
  ) => {
    const value = draftStock[key] ?? currentStock;
    const newStock = Number(value);

    if (
      value === "" ||
      !Number.isInteger(newStock) ||
      newStock < 0
    ) {
      toast.error("Enter a valid non-negative whole number");
      return;
    }

    if (newStock === Number(currentStock)) {
      toast.info("No stock changes to save");
      return;
    }

    try {
      setUpdating((prev) => ({
        ...prev,
        [key]: true,
      }));

      const response = await axios.put(
        backendUrl + "/api/product/updateStock",
        {
          productId,
          color,
          size,
          stock: newStock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Stock updated successfully");

        setDraftStock((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });

        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  // Add purchased stock and update average cost.
  const restock = async (
    product,
    color,
    size,
    currentStock,
    key
  ) => {
    const values = restockDraft[key] || {};

    const quantity = Number(values.quantity);
    const purchaseCost = Number(values.purchaseCost);
    const sellingPriceValue = values.sellingPrice;

    if (
      values.quantity === undefined ||
      values.quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      toast.error("Enter a valid restock quantity");
      return;
    }

    if (
      sellingPriceValue !== undefined &&
      sellingPriceValue !== "" &&
      (!Number.isFinite(Number(sellingPriceValue)) ||
        Number(sellingPriceValue) <= 0)
    ) {
      toast.error("Enter a valid selling price");
      return;
    }

    if (
      values.purchaseCost === undefined ||
      values.purchaseCost === "" ||
      !Number.isFinite(purchaseCost) ||
      purchaseCost <= 0
    ) {
      toast.error("Enter a valid purchase cost per unit");
      return;
    }

    try {
      setRestocking((prev) => ({
        ...prev,
        [key]: true,
      }));

      const payload = {
        productId: product._id,
        color,
        size,
        quantity,
        purchaseCost,
      };

      // Selling price is optional.
      if (
        sellingPriceValue !== undefined &&
        sellingPriceValue !== ""
      ) {
        payload.sellingPrice = Number(sellingPriceValue);
      }

      const response = await axios.put(
        backendUrl + "/api/product/restock",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Stock restocked successfully");

        setRestockDraft((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });

        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    } finally {
      setRestocking((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  // Calculate inventory summary across all variants.
  const inventorySummary = useMemo(() => {
    let totalVariants = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    list.forEach((product) => {
      product.colors?.forEach((color) => {
        color.sizes?.forEach((size) => {
          totalVariants++;

          const stock = Number(size.stock) || 0;

          if (stock <= 0) {
            outOfStock++;
          } else if (stock <= LOW_STOCK_THRESHOLD) {
            lowStock++;
          } else {
            inStock++;
          }
        });
      });
    });

    return {
      totalVariants,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [list]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <img
            src={row.original.image?.[0]}
            alt={row.original.name}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        ),
        size: 80,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 180,
      },
      {
        accessorKey: "brand_name",
        header: "Brand",
        Cell: ({ row }) => {
          const brandName = row.original.brand_name;
          const brandCode = row.original.brand_code;

          if (!brandName) {
            return (
              <Chip
                label="No Brand"
                size="small"
                variant="outlined"
                color="default"
              />
            );
          }

          return (
            <Stack spacing={0.5} alignItems="flex-start">
              <Typography fontWeight="medium">
                {brandName}
              </Typography>
              {brandCode && (
                <Chip
                  label={brandCode}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Stack>
          );
        },
        size: 150,
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 120,
      },
      {
        accessorKey: "price",
        header: "Price",
        Cell: ({ cell }) => currency + cell.getValue(),
        size: 100,
      },
      {
        id: "inventoryStatus",
        header: "Inventory",
        Cell: ({ row }) => {
          const variants =
            row.original.colors?.flatMap(
              (color) => color.sizes || []
            ) || [];

          const totalStock = variants.reduce(
            (sum, variant) =>
              sum + Number(variant.stock || 0),
            0
          );

          const hasOutOfStock = variants.some(
            (variant) => Number(variant.stock) <= 0
          );

          const hasLowStock = variants.some(
            (variant) =>
              Number(variant.stock) > 0 &&
              Number(variant.stock) <= LOW_STOCK_THRESHOLD
          );

          let status = "In Stock";

          if (totalStock === 0) {
            status = "Out of Stock";
          } else if (hasOutOfStock || hasLowStock) {
            status = "Needs Attention";
          }

          return (
            <Chip
              label={`${status} (${totalStock} units)`}
              color={
                status === "Out of Stock"
                  ? "error"
                  : status === "Needs Attention"
                  ? "warning"
                  : "success"
              }
              size="small"
            />
          );
        },
        size: 180,
      },
    ],
    []
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Inventory Management
      </Typography>

      {/* Inventory summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
          <Typography color="text.secondary">
            Total Variants
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {inventorySummary.totalVariants}
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2 }}>
          <Typography color="text.secondary">
            In Stock
          </Typography>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="success.main"
          >
            {inventorySummary.inStock}
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: "#fff8e1", borderRadius: 2 }}>
          <Typography color="text.secondary">
            Low Stock
          </Typography>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="warning.main"
          >
            {inventorySummary.lowStock}
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: "#ffebee", borderRadius: 2 }}>
          <Typography color="text.secondary">
            Out of Stock
          </Typography>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="error.main"
          >
            {inventorySummary.outOfStock}
          </Typography>
        </Box>
      </Box>

      {/* Low-stock alert */}
      {inventorySummary.lowStock > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {inventorySummary.lowStock} product variant(s) have
          low stock. Consider restocking them.
        </Alert>
      )}

      {inventorySummary.outOfStock > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {inventorySummary.outOfStock} product variant(s)
          are out of stock.
        </Alert>
      )}

      <MaterialReactTable
        columns={columns}
        data={list}
        state={{ isLoading: loading }}
        enableSorting
        enableColumnFilters
        enablePagination
        enableBottomToolbar
        enableTopToolbar
        initialState={{
          pagination: { pageSize: 10 },
        }}
        enableExpandAll={false}
        enableExpanding
        renderDetailPanel={({ row }) => {
          const product = row.original;

          return (
            <Box
              sx={{
                padding: 2,
                background: "#fafafa",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" mb={1}>
                Stock Management
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ mb: 2 }}
              >
                <Typography>
                  Current Average Cost:{" "}
                  <strong>
                    {currency}
                    {Number(product.cost_price || 0).toFixed(2)}
                  </strong>
                </Typography>

                <Typography>
                  Current Selling Price:{" "}
                  <strong>
                    {currency}
                    {Number(product.price || 0).toFixed(2)}
                  </strong>
                </Typography>
              </Stack>

              <Alert severity="info" sx={{ mb: 2 }}>
                Restocking adds stock and recalculates the
                product's average cost. All sizes and colors
                share the same average cost.
              </Alert>

              {product.colors?.map((colorObj, idx) => (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Typography fontWeight="bold" mb={1}>
                    {colorObj.color}
                  </Typography>

                  {colorObj.sizes?.map((sizeObj, sIndex) => {
                    const key = getVariantKey(
                      product._id,
                      colorObj.color,
                      sizeObj.size
                    );

                    const stock = Number(sizeObj.stock) || 0;
                    const status = getStockStatus(stock);
                    const values = restockDraft[key] || {};

                    return (
                      <Box
                        key={sIndex}
                        sx={{
                          mt: 1,
                          p: 2,
                          background: "#fff",
                          borderRadius: 2,
                          border: "1px solid #eee",
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1.5}
                          alignItems={{
                            xs: "flex-start",
                            sm: "center",
                          }}
                          flexWrap="wrap"
                        >
                          <Box sx={{ minWidth: 90 }}>
                            <Typography fontWeight="medium">
                              Size: {sizeObj.size}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              SKU: {sizeObj.sku || "N/A"}
                            </Typography>
                          </Box>

                          <Typography>
                            Current Stock: <strong>{stock}</strong>
                          </Typography>

                          <Chip
                            label={status}
                            color={getStatusColor(status)}
                            size="small"
                          />

                          <TextField
                            type="number"
                            size="small"
                            label="Stock"
                            value={draftStock[key] ?? stock}
                            inputProps={{
                              min: 0,
                              step: 1,
                            }}
                            onChange={(e) =>
                              handleStockChange(
                                key,
                                e.target.value
                              )
                            }
                            sx={{ width: 110 }}
                          />

                          <Button
                            variant="contained"
                            size="small"
                            disabled={
                              updating[key] ||
                              Number(draftStock[key] ?? stock) === stock
                            }
                            onClick={() =>
                              updateStock(
                                product._id,
                                colorObj.color,
                                sizeObj.size,
                                stock,
                                key
                              )
                            }
                          >
                            {updating[key]
                              ? "Updating..."
                              : "Update Stock"}
                          </Button>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography
                          fontWeight="medium"
                          mb={1.5}
                        >
                          Restock This Variant
                        </Typography>

                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1.5}
                          alignItems={{
                            xs: "stretch",
                            sm: "center",
                          }}
                          flexWrap="wrap"
                        >
                          <TextField
                            type="number"
                            size="small"
                            label="Quantity to Add"
                            placeholder="e.g. 10"
                            value={values.quantity ?? ""}
                            inputProps={{
                              min: 1,
                              step: 1,
                            }}
                            onChange={(e) =>
                              handleRestockChange(
                                key,
                                "quantity",
                                e.target.value
                              )
                            }
                            sx={{ width: 150 }}
                          />

                          <TextField
                            type="number"
                            size="small"
                            label="Purchase Cost / Unit"
                            placeholder="e.g. 450"
                            value={values.purchaseCost ?? ""}
                            inputProps={{
                              min: 0.01,
                              step: "0.01",
                            }}
                            onChange={(e) =>
                              handleRestockChange(
                                key,
                                "purchaseCost",
                                e.target.value
                              )
                            }
                            sx={{ width: 175 }}
                          />

                          <TextField
                            type="number"
                            size="small"
                            label="New Selling Price (Optional)"
                            placeholder={String(product.price)}
                            value={values.sellingPrice ?? ""}
                            inputProps={{
                              min: 0.01,
                              step: "0.01",
                            }}
                            onChange={(e) =>
                              handleRestockChange(
                                key,
                                "sellingPrice",
                                e.target.value
                              )
                            }
                            sx={{ width: 210 }}
                          />

                          <Button
                            variant="contained"
                            color="success"
                            disabled={restocking[key]}
                            onClick={() =>
                              restock(
                                product,
                                colorObj.color,
                                sizeObj.size,
                                stock,
                                key
                              )
                            }
                          >
                            {restocking[key]
                              ? "Restocking..."
                              : "Restock"}
                          </Button>
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={1}
                        >
                          Leave the new selling price empty to
                          keep the current selling price.
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          );
        }}
      />
    </Box>
  );
};

export default List;
