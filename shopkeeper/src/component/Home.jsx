
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const LOW_STOCK_THRESHOLD = 5;

// Safely parse PostgreSQL JSON fields.
const parseJson = (value, fallback = []) => {
  if (value == null) return fallback;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  return value;
};

const SummaryCard = ({ title, value, description, icon, iconBg }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">
          {value}
        </h2>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg}`}
      >
        {icon}
      </div>
    </div>

    <p className="text-xs text-gray-400 mt-4">{description}</p>
  </div>
);

const Home = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  const effectiveToken =
    token || sessionStorage.getItem("token");

  const fetchDashboardData = async () => {
    if (!effectiveToken) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setOrdersError("");

    const config = {
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
      },
    };

    // Load products and orders independently.
    const [productResult, orderResult] = await Promise.allSettled([
      axios.get(`${backendUrl}/api/product/list`, config),
      axios.post(`${backendUrl}/api/order/list`, {}, config),
    ]);

    // PRODUCTS
    if (productResult.status === "fulfilled") {
      const response = productResult.value.data;

      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
        setError(response.message || "Unable to load products.");
      }
    } else {
      setProducts([]);
      setError(
        productResult.reason?.response?.data?.message ||
        productResult.reason?.message ||
        "Unable to load products."
      );
    }

    // ORDERS
    if (orderResult.status === "fulfilled") {
      const response = orderResult.value.data;

      if (response.success && Array.isArray(response.orders)) {
        setOrders(response.orders);
      } else {
        setOrders([]);
        setOrdersError(response.message || "Unable to load orders.");
      }
    } else {
      setOrders([]);
      setOrdersError(
        orderResult.reason?.response?.data?.message ||
        "Unable to load orders. Check shopkeeper permissions."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveToken]);

  // INVENTORY SUMMARY
  const inventorySummary = useMemo(() => {
    let totalStock = 0;
    let totalVariants = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((product) => {
      const colors = parseJson(product.colors);

      if (!Array.isArray(colors)) return;

      colors.forEach((color) => {
        const sizes = parseJson(color.sizes);

        if (!Array.isArray(sizes)) return;

        sizes.forEach((size) => {
          totalVariants++;

          const stock = Math.max(0, Number(size.stock) || 0);

          totalStock += stock;

          if (stock === 0) {
            outOfStock++;
          } else if (stock <= LOW_STOCK_THRESHOLD) {
            lowStock++;
          }
        });
      });
    });

    return {
      totalProducts: products.length,
      totalVariants,
      totalStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  // ORDER SUMMARY
  const orderSummary = useMemo(() => {
    const pendingOrders = orders.filter(
      (order) =>
        String(order.status || "").trim().toLowerCase() ===
        "order placed"
    );

    const approvedOrders = orders.filter(
      (order) =>
        String(order.status || "").trim().toLowerCase() ===
        "approved"
    );

    const cancelledOrders = orders.filter(
      (order) =>
        String(order.status || "").trim().toLowerCase() ===
        "cancelled"
    );

    return {
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      approvedOrders: approvedOrders.length,
      cancelledOrders: cancelledOrders.length,
    };
  }, [orders]);

  // RECENT ORDERS
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          a.date || a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.date || b.created_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  const getOrderStatusColor = (status) => {
    switch (String(status || "").trim().toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "approved":
        return "bg-emerald-100 text-emerald-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "out for delivery":
        return "bg-blue-100 text-blue-700";

      case "order placed":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Addis_Ababa",
    }).format(date);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Shopkeeper Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage daily store operations, inventory, and customer orders.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* PRODUCT ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && products.length === 0 && orders.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* INVENTORY OVERVIEW */}
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Inventory Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total Products"
              value={inventorySummary.totalProducts.toLocaleString()}
              description="Products registered in the store"
              icon="📦"
              iconBg="bg-blue-50"
            />

            <SummaryCard
              title="Total Stock Units"
              value={inventorySummary.totalStock.toLocaleString()}
              description="Units across all sizes and colors"
              icon="🛍️"
              iconBg="bg-purple-50"
            />

            <SummaryCard
              title="Low Stock Variants"
              value={inventorySummary.lowStock.toLocaleString()}
              description={`Variants with 1–${LOW_STOCK_THRESHOLD} units`}
              icon="⚠️"
              iconBg="bg-yellow-50"
            />

            <SummaryCard
              title="Out of Stock"
              value={inventorySummary.outOfStock.toLocaleString()}
              description="Variants with zero available units"
              icon="🚫"
              iconBg="bg-red-50"
            />
          </div>

          {/* INVENTORY ALERTS */}
          {(inventorySummary.lowStock > 0 ||
            inventorySummary.outOfStock > 0) && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Inventory Alerts
              </h3>

              {inventorySummary.lowStock > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-2">
                  <p className="text-sm text-yellow-800">
                    <strong>{inventorySummary.lowStock} variant(s)</strong>{" "}
                    have low stock. Consider restocking them.
                  </p>
                </div>
              )}

              {inventorySummary.outOfStock > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>{inventorySummary.outOfStock} variant(s)</strong>{" "}
                    are out of stock.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ORDER OVERVIEW */}
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Order Overview
          </h2>

          {ordersError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                {ordersError}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                The order endpoint may currently be restricted to administrators.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                title="Total Orders"
                value={orderSummary.totalOrders.toLocaleString()}
                description="All recorded customer orders"
                icon="🧾"
                iconBg="bg-indigo-50"
              />

              <SummaryCard
                title="Pending Orders"
                value={orderSummary.pendingOrders.toLocaleString()}
                description="Orders awaiting approval"
                icon="⏳"
                iconBg="bg-orange-50"
              />

              <SummaryCard
                title="Approved Orders"
                value={orderSummary.approvedOrders.toLocaleString()}
                description="Orders approved for fulfillment"
                icon="📋"
                iconBg="bg-green-50"
              />

              <SummaryCard
                title="Cancelled Orders"
                value={orderSummary.cancelledOrders.toLocaleString()}
                description="Orders that have been cancelled"
                icon="❌"
                iconBg="bg-red-50"
              />
            </div>
          )}

          {/* RECENT ORDERS */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Orders
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Latest customer orders
                </p>
              </div>

              <span className="text-sm text-gray-400">
                Latest 5
              </span>
            </div>

            {ordersError ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Orders are unavailable for this account.
              </p>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-500 font-medium">
                  No orders yet
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  New customer orders will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="py-3 px-3 font-medium">Order ID</th>
                      <th className="py-3 px-3 font-medium">Date</th>
                      <th className="py-3 px-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr
                        key={order._id || order.id || index}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-3 px-3 font-medium text-gray-800">
                          #{order._id || order.id || "N/A"}
                        </td>

                        <td className="py-3 px-3 text-gray-600">
                          {formatDate(order.date || order.created_at)}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status || "Order placed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
