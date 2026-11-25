
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";

const formatMoney = (amount) =>
  `${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleString();
};

const formatPaymentMethod = (method) => {
  if (method === "cash") return "Cash";
  if (method === "online_transfer") return "Online Transfer";
  return "Unknown";
};


const SalesHistory = ({ token }) => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    onlineSalesCount: 0,
    posSalesCount: 0,
    totalSalesCount: 0,
    profitAvailableCount: 0,
    profitUnavailableCount: 0,
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "All",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    type: "All",
  });

  const [expandedSale, setExpandedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${backendUrl}/api/order/sales-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            startDate: appliedFilters.startDate || undefined,
            endDate: appliedFilters.endDate || undefined,
            type: appliedFilters.type,
          },
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch sales history");
      }

      setSales(data.sales || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error("Sales history error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load sales history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, [token, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setError("Start date cannot be after end date.");
      return;
    }

    setAppliedFilters({ ...filters });
    setExpandedSale(null);
  };

  const handleResetFilters = () => {
    const reset = {
      startDate: "",
      endDate: "",
      type: "All",
    };

    setFilters(reset);
    setAppliedFilters(reset);
    setExpandedSale(null);
    setError("");
  };

  const toggleSaleDetails = (sale) => {
    const saleKey = `${sale.sale_type}-${sale.id}`;

    setExpandedSale((prev) =>
      prev === saleKey ? null : saleKey
    );
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatMoney(summary.totalRevenue),
      description: `${summary.totalSalesCount || 0} transactions`,
    },
    {
      title: "Recorded Profit",
      value: formatMoney(summary.totalProfit),
      description: `${summary.profitAvailableCount || 0} transactions with known cost`,
    },
    {
      title: "Online Sales",
      value: summary.onlineSalesCount || 0,
      description: "Verified online orders",
    },
    {
      title: "POS Sales",
      value: summary.posSalesCount || 0,
      description: "In-person transactions",
    },

{
  title: "Cash Payments",
  value: formatMoney(summary.cashRevenue),
  description: `${summary.cashSalesCount || 0} transactions`,
},
{
  title: "Online Transfer Payments",
  value: formatMoney(summary.onlineTransferRevenue),
  description: `${summary.onlineTransferSalesCount || 0} transactions`,
},
{
  title: "Unknown Payments",
  value: formatMoney(summary.unknownPaymentRevenue),
  description: `${summary.unknownPaymentSalesCount || 0} transactions`,
},

  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Sales History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor online and in-person sales transactions.
          </p>
        </div>

        <button
          onClick={fetchSalesHistory}
          disabled={loading}
          className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.title}</p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-2 break-words">
              {card.value}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Profit Notice */}
      {summary.profitUnavailableCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Profit is unavailable for {summary.profitUnavailableCount}{" "}
            transaction(s) because historical cost information is missing.
            Recorded profit includes only transactions with known costs.
          </p>
        </div>
      )}

      {/* Filters */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-white border border-gray-200 rounded-lg p-5"
      >
        <h2 className="font-semibold text-gray-800 mb-4">
          Filter Transactions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Sale Type
            </label>

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-black bg-white"
            >
              <option value="All">All Sales</option>
              <option value="Online">Online Sales</option>
              <option value="POS">POS Sales</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex justify-between items-center gap-3">
          <p className="text-sm">{error}</p>

          <button
            onClick={() => setError("")}
            className="font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-800">
              Transactions
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {sales.length} transaction(s) found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading sales history...
          </div>
        ) : sales.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-700 font-medium">
              No sales found
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Try changing your filters or check back after a sale.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Transaction</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Customer / Seller</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Profit</th>
                  <th className="px-5 py-4">Payment Method</th>
                  <th className="px-5 py-4">Details</th>
                  
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => {
                  const saleKey = `${sale.sale_type}-${sale.id}`;
                  const isExpanded = expandedSale === saleKey;

                  return (
                    <React.Fragment key={saleKey}>
                      <tr className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-800">
                          #{sale.id}
                        </td>

                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(sale.date)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              sale.sale_type === "POS"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {sale.sale_type}
                          </span>
                        </td>
                        

                        <td className="px-5 py-4 text-gray-600">
                          {sale.sale_type === "POS"
                            ? `Seller #${sale.reference_user_id}`
                            : `Customer #${sale.reference_user_id}`}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">
                          {formatMoney(sale.total_amount)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {sale.profit_available ? (
                            <span className="text-green-700 font-medium">
                              {formatMoney(sale.profit)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Unavailable
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      sale.payment_method === "cash"
        ? "bg-emerald-100 text-emerald-700"
        : sale.payment_method === "online_transfer"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {formatPaymentMethod(sale.payment_method)}
  </span>
</td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleSaleDetails(sale)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Transaction Details */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan="8" className="px-5 py-5">
                            <h3 className="font-semibold text-gray-800 mb-3">
                              Transaction #{sale.id} - Products
                            </h3>

                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-gray-500 border-b border-gray-200">
                                    <th className="py-3 pr-4 text-left">
                                      Product
                                    </th>
                                    <th className="py-3 pr-4 text-left">
                                      Variant
                                    </th>
                                    <th className="py-3 pr-4 text-left">
                                      SKU
                                    </th>
                                    <th className="py-3 pr-4 text-right">
                                      Quantity
                                    </th>
                                    <th className="py-3 pr-4 text-right">
                                      Cost Price
                                    </th>
                                    <th className="py-3 pr-4 text-right">
                                      Selling Price
                                    </th>
                                    <th className="py-3 text-right">
                                      Line Total
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {(sale.items || []).map((item, index) => {
                                    const costPrice =
                                      item.costPrice ?? item.cost_price;

                                    const sellingPrice =
                                      item.unitSellingPrice ??
                                      item.price ??
                                      item.unit_selling_price;

                                    const quantity = Number(item.quantity || 0);

                                    return (
                                      <tr
                                        key={`${item.productId || item.itemId || index}-${index}`}
                                        className="border-b border-gray-100"
                                      >
                                        <td className="py-3 pr-4 font-medium text-gray-800">
                                          {item.productName ||
                                            item.name ||
                                            "Product"}
                                        </td>

                                        <td className="py-3 pr-4 text-gray-600">
                                          {[item.color, item.size]
                                            .filter(Boolean)
                                            .join(" / ") || "N/A"}
                                        </td>

                                        <td className="py-3 pr-4 text-gray-500">
                                          {item.sku || "N/A"}
                                        </td>

                                        <td className="py-3 pr-4 text-right">
                                          {quantity}
                                        </td>

                                        <td className="py-3 pr-4 text-right whitespace-nowrap">
                                          {costPrice == null
                                            ? "Unavailable"
                                            : formatMoney(costPrice)}
                                        </td>

                                        <td className="py-3 pr-4 text-right whitespace-nowrap">
                                          {sellingPrice == null
                                            ? "N/A"
                                            : formatMoney(sellingPrice)}
                                        </td>

                                        <td className="py-3 text-right font-medium whitespace-nowrap">
                                          {sellingPrice == null
                                            ? "N/A"
                                            : formatMoney(
                                                Number(sellingPrice) * quantity
                                              )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 text-sm">
                              <p className="text-gray-600">
                                Transaction total:{" "}
                                <span className="font-semibold text-gray-800">
                                  {formatMoney(sale.total_amount)}
                                </span>
                              </p>

                              <p className="text-gray-600 sm:ml-6">
                                Profit:{" "}
                                <span className="font-semibold text-gray-800">
                                  {sale.profit_available
                                    ? formatMoney(sale.profit)
                                    : "Unavailable"}
                                </span>
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
