
import React, { useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const POS = ({ token }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitSellingPrice, setUnitSellingPrice] = useState("");

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [completingSale, setCompletingSale] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // =========================
  // Search products by name, product tag, or SKU
  // =========================
  const searchProducts = async (e) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Enter a product name, product tag, or SKU");
      return;
    }

    try {
      setSearching(true);
      setSelectedProduct(null);

      const response = await axios.get(
        `${backendUrl}/api/product/search?query=${encodeURIComponent(
          searchQuery.trim()
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const results =
          response.data.products ||
          response.data.data ||
          response.data.results ||
          [];

        setProducts(results);

        if (results.length === 0) {
          toast.info("No available products found");
        }
      } else {
        setProducts([]);
        toast.error(response.data.message || "Search failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to search products"
      );
      setProducts([]);
    } finally {
      setSearching(false);
    }
  };

  // =========================
  // Select product
  // =========================
  const selectProduct = (product) => {
    setSelectedProduct(product);

    const availableColors = (product.colors || []).filter((color) =>
      color.sizes?.some((size) => Number(size.stock) > 0)
    );

    if (availableColors.length === 0) {
      toast.error("This product has no available stock");
      setSelectedProduct(null);
      return;
    }

    const firstColor = availableColors[0];

    const availableSizes = firstColor.sizes.filter(
      (size) => Number(size.stock) > 0
    );

    setSelectedColor(firstColor.color);
    setSelectedSize(availableSizes[0]?.size || "");
    setQuantity(1);
    setUnitSellingPrice(String(product.price));
  };

  // =========================
  // Get selected color and size
  // =========================
  const currentColor = selectedProduct?.colors?.find(
    (color) => color.color === selectedColor
  );

  const availableSizes =
    currentColor?.sizes?.filter((size) => Number(size.stock) > 0) || [];

  const currentSize = currentColor?.sizes?.find(
    (size) => size.size === selectedSize
  );

  // =========================
  // Add item to cart
  // =========================
  const addToCart = () => {
    if (!selectedProduct) {
      toast.error("Select a product first");
      return;
    }

    if (!selectedColor || !selectedSize) {
      toast.error("Select color and size");
      return;
    }

    const selectedQuantity = Number(quantity);
    const sellingPrice = Number(unitSellingPrice);
    const costPrice = Number(selectedProduct.cost_price);
    const stock = Number(currentSize?.stock || 0);

    if (
      !Number.isInteger(selectedQuantity) ||
      selectedQuantity <= 0
    ) {
      toast.error("Enter a valid quantity");
      return;
    }

    if (selectedQuantity > stock) {
      toast.error(`Only ${stock} items are available`);
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      toast.error("Enter a valid selling price");
      return;
    }

    if (sellingPrice < costPrice) {
      toast.error(
        `Selling price cannot be below cost price (${currency}${costPrice})`
      );
      return;
    }

    const productId = selectedProduct._id || selectedProduct.id;

    const existingItem = cart.find(
      (item) =>
        String(item.productId) === String(productId) &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    const existingQuantity = existingItem?.quantity || 0;

    if (existingQuantity + selectedQuantity > stock) {
      toast.error(
        `Available stock is ${stock}. You already added ${existingQuantity}.`
      );
      return;
    }

    const newItem = {
      productId,
      productName: selectedProduct.name,
      productTag: selectedProduct.product_tag || "",
      sku: currentSize?.sku || "",
      color: selectedColor,
      size: selectedSize,
      quantity: selectedQuantity,
      costPrice,
      originalPrice: Number(selectedProduct.price),
      unitSellingPrice: sellingPrice,
      availableStock: stock,
      image: Array.isArray(selectedProduct.image)
        ? selectedProduct.image[0]
        : selectedProduct.image,
    };

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          String(item.productId) === String(productId) &&
          item.color === selectedColor &&
          item.size === selectedSize
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + selectedQuantity,
                unitSellingPrice: sellingPrice,
              }
            : item
        );
      }

      return [...prev, newItem];
    });

    toast.success("Product added to cart");

    setSelectedProduct(null);
    setSelectedColor("");
    setSelectedSize("");
    setQuantity(1);
    setUnitSellingPrice("");
  };

  // =========================
  // Remove cart item
  // =========================
  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // Update cart quantity
  // =========================
  const updateCartQuantity = (index, newQuantity) => {
    const value = Number(newQuantity);

    if (!Number.isInteger(value) || value <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (value > item.availableStock) {
          toast.error(
            `Only ${item.availableStock} items are available`
          );
          return item;
        }

        return { ...item, quantity: value };
      })
    );
  };

  // =========================
  // Calculate totals
  // =========================
  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.unitSellingPrice * item.quantity,
    0
  );

  const estimatedProfit = cart.reduce(
    (total, item) =>
      total +
      (item.unitSellingPrice - item.costPrice) * item.quantity,
    0
  );

  // =========================
  // Complete POS sale
  // =========================
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Add products to the cart first");
      return;
    }

    try {
      setCompletingSale(true);

      const items = cart.map((item) => ({
        productId: item.productId,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitSellingPrice: item.unitSellingPrice,
      }));

      const response = await axios.post(
        `${backendUrl}/api/order/pos`,
        { items, paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReceipt(response.data.sale);
        setCart([]);
        setPaymentMethod("cash");
        setProducts([]);
        setSelectedProduct(null);
        setSearchQuery("");
        setSelectedColor("");
        setSelectedSize("");
        setUnitSellingPrice("");
        setQuantity(1);

        toast.success("Sale completed successfully");
      } else {
        toast.error(response.data.message || "Failed to complete sale");
      }
    } catch (error) {
      console.error("POS SALE ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to complete sale. Please try again."
      );
    } finally {
      setCompletingSale(false);
    }
  };

  // =========================
  // Start a new sale
  // =========================
  const startNewSale = () => {
    setReceipt(null);
    setCart([]);
    setPaymentMethod("cash");
    setProducts([]);
    setSearchQuery("");
    setSelectedProduct(null);
  };

  return (
    <div className="w-full pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Point of Sale</h2>
        <p className="text-sm text-gray-500 mt-1">
          Search products and record in-person sales.
        </p>
      </div>

      {/* ================= RECEIPT ================= */}
      {receipt && (
        <div className="max-w-2xl mx-auto border rounded-lg p-6 bg-white">
          <div className="text-center mb-6">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <h3 className="text-xl font-semibold">
              Sale Completed Successfully
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Your transaction has been recorded.
            </p>
          </div>

          <div className="border-y py-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sale ID</span>
              <span className="font-medium">#{receipt.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>
                {receipt.date
                  ? new Date(receipt.date).toLocaleString()
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium">
                {receipt.payment_method === "online_transfer"
                  ? "Online Transfer"
                  : receipt.payment_method === "cash"
                  ? "Cash"
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span>{receipt.items?.length || 0}</span>
            </div>
          </div>

          <div className="py-4">
            <h4 className="font-medium mb-3">Sale Details</h4>

            {receipt.items?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between gap-3 text-sm py-2 border-b"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-gray-500">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                  <p className="text-gray-500">
                    {currency}
                    {Number(item.unitSellingPrice).toLocaleString()} each
                  </p>
                </div>

                <p className="font-medium whitespace-nowrap">
                  {currency}
                  {(
                    Number(item.unitSellingPrice) *
                    Number(item.quantity)
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-lg font-semibold py-3">
            <span>Total</span>
            <span>
              {currency}
              {Number(receipt.total_amount).toLocaleString()}
            </span>
          </div>

          <button
            onClick={startNewSale}
            className="w-full bg-black text-white py-3 mt-4 rounded hover:bg-gray-800"
          >
            Start New Sale
          </button>
        </div>
      )}

      {/* ================= POS CONTENT ================= */}
      {!receipt && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="xl:col-span-2 space-y-6">
            {/* PRODUCT SEARCH */}
            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-4">Search Products</h3>

              <form
                onSubmit={searchProducts}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, tag, or SKU..."
                  className="flex-1 border px-3 py-3 rounded outline-none focus:border-black"
                />

                <button
                  type="submit"
                  disabled={searching}
                  className="bg-black text-white px-6 py-3 rounded disabled:opacity-50"
                >
                  {searching ? "SEARCHING..." : "SEARCH"}
                </button>
              </form>

              {/* SEARCH RESULTS */}
              {products.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm text-gray-500 mb-3">
                    Search results ({products.length})
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((product) => {
                      const stockCount = (product.colors || []).reduce(
                        (total, color) =>
                          total +
                          (color.sizes || []).reduce(
                            (sum, size) =>
                              sum + Number(size.stock || 0),
                            0
                          ),
                        0
                      );

                      const image = Array.isArray(product.image)
                        ? product.image[0]
                        : product.image;

                      return (
                        <button
                          key={product._id || product.id}
                          type="button"
                          onClick={() => selectProduct(product)}
                          className={`flex items-center gap-3 text-left border rounded-lg p-3 hover:border-black transition ${
                            selectedProduct?._id === product._id
                              ? "border-black bg-gray-50"
                              : ""
                          }`}
                        >
                          {image && (
                            <img
                              src={image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>

                            {product.product_tag && (
                              <p className="text-xs font-semibold text-blue-700 mt-1">
                                Tag: {product.product_tag}
                              </p>
                            )}

                            <p className="text-sm text-gray-500">
                              {product.category}
                            </p>

                            <p className="text-sm font-medium mt-1">
                              {currency}
                              {Number(product.price).toLocaleString()}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Stock: {stockCount}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT CONFIGURATION */}
            {selectedProduct && (
              <div className="bg-white border rounded-lg p-5">
                <h3 className="font-semibold mb-4">
                  Select Product Options
                </h3>

                <div className="mb-4">
                  <p className="font-medium">{selectedProduct.name}</p>

                  {selectedProduct.product_tag && (
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      Product Tag: {selectedProduct.product_tag}
                    </p>
                  )}

                  <p className="text-sm text-gray-500 mt-1">
                    Default price: {currency}
                    {Number(selectedProduct.price).toLocaleString()}
                  </p>
                </div>

                {/* COLOR */}
                <div className="mb-4">
                  <label className="block text-sm mb-2">
                    Color
                  </label>

                  <select
                    value={selectedColor}
                    onChange={(e) => {
                      const colorName = e.target.value;
                      setSelectedColor(colorName);

                      const color = selectedProduct.colors.find(
                        (c) => c.color === colorName
                      );

                      const firstAvailable = color?.sizes?.find(
                        (s) => Number(s.stock) > 0
                      );

                      setSelectedSize(firstAvailable?.size || "");
                    }}
                    className="w-full sm:w-64 border px-3 py-2 rounded"
                  >
                    {selectedProduct.colors
                      ?.filter((color) =>
                        color.sizes?.some(
                          (size) => Number(size.stock) > 0
                        )
                      )
                      .map((color) => (
                        <option key={color.color} value={color.color}>
                          {color.color}
                        </option>
                      ))}
                  </select>
                </div>

                {/* SIZE */}
                <div className="mb-4">
                  <label className="block text-sm mb-2">
                    Size
                  </label>

                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full sm:w-64 border px-3 py-2 rounded"
                  >
                    {availableSizes.map((size) => (
                      <option key={size.size} value={size.size}>
                        {size.size} — {size.stock} available
                      </option>
                    ))}
                  </select>
                </div>

                {/* QUANTITY */}
                <div className="mb-4">
                  <label className="block text-sm mb-2">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={currentSize?.stock || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full sm:w-64 border px-3 py-2 rounded"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Available stock: {currentSize?.stock || 0}
                  </p>
                </div>

                {/* NEGOTIATED PRICE */}
                <div className="mb-5">
                  <label className="block text-sm mb-2">
                    Agreed Selling Price (ETB)
                  </label>

                  <input
                    type="number"
                    min={selectedProduct.cost_price}
                    step="0.01"
                    value={unitSellingPrice}
                    onChange={(e) =>
                      setUnitSellingPrice(e.target.value)
                    }
                    className="w-full sm:w-64 border px-3 py-2 rounded"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Cost price: {currency}
                    {Number(
                      selectedProduct.cost_price
                    ).toLocaleString()}
                    . You cannot sell below cost price.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addToCart}
                    className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="border px-6 py-3 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: CART */}
          <div className="xl:col-span-1">
            <div className="bg-white border rounded-lg p-5 sticky top-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-lg">
                  Current Sale
                </h3>

                <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {cart.length} items
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs mt-1">
                    Search and add products to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[450px] overflow-y-auto">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="border-b pb-4"
                    >
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">
                            {item.productName}
                          </p>

                          {item.productTag && (
                            <p className="text-xs font-semibold text-blue-700 mt-1">
                              Tag: {item.productTag}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mt-1">
                            {item.color} / {item.size}
                          </p>

                          {item.sku && (
                            <p className="text-xs text-gray-400">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex justify-between items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQuantity(index, e.target.value)
                          }
                          className="w-16 border rounded px-2 py-1 text-sm"
                        />

                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {currency}
                            {(
                              item.unitSellingPrice * item.quantity
                            ).toLocaleString()}
                          </p>

                          <p className="text-xs text-gray-400">
                            {currency}
                            {item.unitSellingPrice.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAYMENT METHOD */}
              <div className="border-t mt-5 pt-4">
                <label className="block text-sm font-medium mb-2">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={cart.length === 0 || completingSale}
                  className="w-full border px-3 py-2 rounded bg-white disabled:bg-gray-100"
                >
                  <option value="cash">Cash</option>
                  <option value="online_transfer">Online Transfer</option>
                </select>
              </div>

              {/* TOTALS */}
              <div className="border-t mt-5 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total quantity</span>
                  <span>{totalQuantity}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {currency}
                    {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Estimated profit
                  </span>
                  <span className="text-green-600 font-medium">
                    {currency}
                    {estimatedProfit.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total</span>
                  <span>
                    {currency}
                    {subtotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={completeSale}
                  disabled={cart.length === 0 || completingSale}
                  className="w-full bg-black text-white py-3 rounded mt-3 disabled:opacity-50 hover:bg-gray-800"
                >
                  {completingSale
                    ? "PROCESSING..."
                    : "Complete Sale"}
                </button>

                <button
                  type="button"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0 || completingSale}
                  className="w-full border py-2 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
