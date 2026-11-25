
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";

const TIME_ZONE = "Africa/Addis_Ababa";

// Get today's date using Addis Ababa timezone
const getTodayDateString = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

// Add or subtract days without browser timezone differences
const addDaysToDateString = (dateString, days) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

// Default reporting period: last 30 days
const getDefaultDates = () => {
  const today = getTodayDateString();

  return {
    startDate: addDaysToDateString(today, -29),
    endDate: today,
  };
};

const formatMoney = (value) =>
  `${currency} ${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;

const formatChartDate = (value, groupBy) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  if (groupBy === "month") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: TIME_ZONE,
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: TIME_ZONE,
  }).format(date);
};

const formatTooltipDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
};

// Summary card
const SummaryCard = ({ title, value, description, icon, iconBg }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-2 break-words">
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

// Revenue and profit chart
const SalesChart = ({ data, groupBy }) => {
  const chartWidth = 800;
  const chartHeight = 290;
  const left = 75;
  const right = 25;
  const top = 25;
  const bottom = 55;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const maxValue = Math.max(
    1,
    ...data.map((item) =>
      Math.max(
        Number(item.revenue || 0),
        Number(item.profit || 0)
      )
    )
  );

  const maxAxis = Math.ceil(maxValue / 1000) * 1000 || 1000;

  const x = (index) =>
    left +
    (data.length <= 1
      ? plotWidth / 2
      : (index / (data.length - 1)) * plotWidth);

  const y = (value) =>
    top + plotHeight - (Number(value || 0) / maxAxis) * plotHeight;

  const revenuePoints = data.map((item, index) => ({
    x: x(index),
    y: y(item.revenue),
  }));

  const profitSegments = [];
  let currentSegment = [];

  data.forEach((item, index) => {
    if (item.profit === null || item.profit === undefined) {
      if (currentSegment.length) {
        profitSegments.push(currentSegment);
        currentSegment = [];
      }
      return;
    }

    currentSegment.push({
      x: x(index),
      y: y(item.profit),
    });
  });

  if (currentSegment.length) {
    profitSegments.push(currentSegment);
  }

  const revenueLine = revenuePoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const yTicks = 4;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-5 mb-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600">Revenue</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-600">Recorded profit</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No chart data available.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[600px]"
            role="img"
            aria-label="Revenue and recorded profit trend chart"
          >
            {Array.from({ length: yTicks + 1 }).map((_, index) => {
              const value = (maxAxis / yTicks) * index;
              const position = y(value);

              return (
                <g key={index}>
                  <line
                    x1={left}
                    y1={position}
                    x2={chartWidth - right}
                    y2={position}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />

                  <text
                    x={left - 10}
                    y={position + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#9ca3af"
                  >
                    {value >= 1000
                      ? `${(value / 1000).toFixed(
                          value % 1000 === 0 ? 0 : 1
                        )}k`
                      : value}
                  </text>
                </g>
              );
            })}

            <polyline
              points={revenueLine}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {profitSegments.map((segment, index) => (
              <polyline
                key={index}
                points={segment
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {data.map((item, index) => (
              <g key={`${item.period}-${index}`}>
                <circle
                  cx={x(index)}
                  cy={y(item.revenue)}
                  r="4"
                  fill="#3b82f6"
                >
                  <title>
                    {formatTooltipDate(item.period)}: Revenue{" "}
                    {formatMoney(item.revenue)}
                  </title>
                </circle>

                {item.profit !== null && item.profit !== undefined && (
                  <circle
                    cx={x(index)}
                    cy={y(item.profit)}
                    r="4"
                    fill="#10b981"
                  >
                    <title>
                      {formatTooltipDate(item.period)}: Profit{" "}
                      {formatMoney(item.profit)}
                    </title>
                  </circle>
                )}

                {(data.length <= 12 ||
                  index % Math.ceil(data.length / 10) === 0 ||
                  index === data.length - 1) && (
                  <text
                    x={x(index)}
                    y={chartHeight - 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#9ca3af"
                  >
                    {formatChartDate(item.period, groupBy)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Profit is displayed only for transactions with available historical
        cost information.
      </p>
    </div>
  );
};

// Online versus POS comparison
const SalesComparison = ({ onlineRevenue, posRevenue }) => {
  const online = Number(onlineRevenue || 0);
  const pos = Number(posRevenue || 0);
  const total = online + pos;

  const onlinePercentage = total ? (online / total) * 100 : 0;
  const posPercentage = total ? (pos / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 text-lg">
        Sales Channel Comparison
      </h3>

      <p className="text-sm text-gray-400 mt-1">
        Revenue generated by each sales channel
      </p>

      <div className="mt-7">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Online Sales
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {formatMoney(online)}
          </span>
        </div>

        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${onlinePercentage}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {onlinePercentage.toFixed(1)}% of revenue
        </p>
      </div>

      <div className="mt-7">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            POS Sales
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {formatMoney(pos)}
          </span>
        </div>

        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${posPercentage}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {posPercentage.toFixed(1)}% of revenue
        </p>
      </div>

      <div className="border-t border-gray-100 mt-6 pt-5 flex justify-between">
        <span className="text-sm text-gray-500">Combined revenue</span>
        <span className="font-bold text-gray-800">
          {formatMoney(total)}
        </span>
      </div>
    </div>
  );
};

const Home = ({ token }) => {
  const [filters, setFilters] = useState(() => ({
    ...getDefaultDates(),
    groupBy: "day",
  }));

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chartData = analytics?.chart || [];
  const summary = analytics?.summary || {};

  const effectiveToken =
    token || sessionStorage.getItem("token");

  const fetchAnalytics = async () => {
    if (!effectiveToken) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    if (filters.startDate > filters.endDate) {
      setError("Start date cannot be later than end date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${backendUrl}/api/order/sales-analytics`,
        {
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
          },
          params: {
            startDate: filters.startDate,
            endDate: filters.endDate,
            groupBy: filters.groupBy,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load sales analytics."
        );
      }

      setAnalytics(response.data);
    } catch (err) {
      console.error("Dashboard analytics error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Fetch again whenever the selected date range or grouping changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveToken,
    filters.startDate,
    filters.endDate,
    filters.groupBy,
  ]);

  const profitDisplay =
    summary.totalProfit === null ||
    summary.totalProfit === undefined
      ? "N/A"
      : formatMoney(summary.totalProfit);

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Quick reporting period
  const setQuickRange = (days) => {
    const today = getTodayDateString();

    setFilters((previous) => ({
      ...previous,
      startDate: addDaysToDateString(today, -(days - 1)),
      endDate: today,
    }));
  };

  // Check which quick filter is currently selected
  const isQuickRangeSelected = (days) => {
    const today = getTodayDateString();
    const expectedStart = addDaysToDateString(today, -(days - 1));

    return (
      filters.startDate === expectedStart &&
      filters.endDate === today
    );
  };

  const profitCoverage = useMemo(() => {
    const available = Number(summary.profitAvailableCount || 0);
    const unavailable = Number(summary.profitUnavailableCount || 0);
    const total = available + unavailable;

    return total
      ? `${available} of ${total} transactions`
      : "No recorded transactions";
  }, [
    summary.profitAvailableCount,
    summary.profitUnavailableCount,
  ]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor your store's sales and performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
        >
          <span>↻</span>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Reporting period
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Today", days: 1 },
                { label: "Last 7 days", days: 7 },
                { label: "Last 30 days", days: 30 },
                { label: "Last 90 days", days: 90 },
              ].map((option) => {
                const selected = isQuickRangeSelected(option.days);

                return (
                  <button
                    key={option.days}
                    onClick={() => setQuickRange(option.days)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      selected
                        ? "bg-blue-50 text-blue-600 border-blue-200 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start date
              </label>
              <input
                type="date"
                value={filters.startDate}
                max={filters.endDate}
                onChange={(e) =>
                  updateFilter("startDate", e.target.value)
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                End date
              </label>
              <input
                type="date"
                value={filters.endDate}
                min={filters.startDate}
                max={getTodayDateString()}
                onChange={(e) =>
                  updateFilter("endDate", e.target.value)
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Group by
              </label>
              <select
                value={filters.groupBy}
                onChange={(e) =>
                  updateFilter("groupBy", e.target.value)
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !analytics ? (
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
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total Revenue"
              value={formatMoney(summary.totalRevenue)}
              description="Online and POS sales combined"
              icon="💰"
              iconBg="bg-blue-50"
            />

            <SummaryCard
              title="Recorded Profit"
              value={profitDisplay}
              description={profitCoverage}
              icon="📈"
              iconBg="bg-emerald-50"
            />

            <SummaryCard
              title="Total Transactions"
              value={Number(summary.totalSalesCount || 0).toLocaleString()}
              description="Qualifying online and POS sales"
              icon="🧾"
              iconBg="bg-purple-50"
            />

            <SummaryCard
              title="Profit Available"
              value={`${Number(
                summary.profitAvailableCount || 0
              ).toLocaleString()} / ${Number(
                summary.totalSalesCount || 0
              ).toLocaleString()}`}
              description="Transactions with historical cost data"
              icon="📊"
              iconBg="bg-orange-50"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Revenue & Profit Trends
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Sales performance over the selected period
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {filters.groupBy === "day"
                    ? "Daily"
                    : filters.groupBy === "week"
                    ? "Weekly"
                    : "Monthly"}{" "}
                  view
                </span>
              </div>

              {loading && analytics && (
                <p className="text-xs text-blue-500 mb-2">
                  Updating chart...
                </p>
              )}

              <SalesChart
                data={chartData}
                groupBy={filters.groupBy}
              />
            </div>

            <SalesComparison
              onlineRevenue={summary.onlineRevenue}
              posRevenue={summary.posRevenue}
            />
          </div>

          {/* Transaction breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Transaction Overview
            </h3>

            <p className="text-sm text-gray-400 mt-1 mb-5">
              Breakdown by sales channel
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">
                    Online Transactions
                  </span>
                  <span className="text-xl">🛒</span>
                </div>

                <h2 className="text-2xl font-bold text-blue-800 mt-3">
                  {Number(
                    summary.onlineSalesCount || 0
                  ).toLocaleString()}
                </h2>

                <p className="text-sm text-blue-600 mt-1">
                  {formatMoney(summary.onlineRevenue)}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-700">
                    POS Transactions
                  </span>
                  <span className="text-xl">🏪</span>
                </div>

                <h2 className="text-2xl font-bold text-emerald-800 mt-3">
                  {Number(
                    summary.posSalesCount || 0
                  ).toLocaleString()}
                </h2>

                <p className="text-sm text-emerald-600 mt-1">
                  {formatMoney(summary.posRevenue)}
                </p>
              </div>
            </div>

            {Number(summary.profitUnavailableCount || 0) > 0 && (
              <div className="mt-5 rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p className="text-sm text-amber-800">
                  <strong>
                    {summary.profitUnavailableCount} transaction(s)
                  </strong>{" "}
                  do not have historical cost information. Their revenue is
                  included, but their profit is excluded from the recorded
                  profit total.
                </p>
              </div>
            )}
          </div>

{/* Payment Method Overview */}
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6">
  <h3 className="text-lg font-semibold text-gray-800">
    Payment Method Overview
  </h3>

  <p className="text-sm text-gray-400 mt-1 mb-5">
    Revenue collected through each payment method for the selected period.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    <div className="rounded-lg bg-emerald-50 p-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-emerald-700">
          Cash
        </span>
        <span className="text-xl">💵</span>
      </div>

      <h2 className="text-2xl font-bold text-emerald-800 mt-3">
        {formatMoney(summary.cashRevenue)}
      </h2>

      <p className="text-sm text-emerald-600 mt-1">
        {Number(summary.cashSalesCount || 0)} transactions
      </p>
    </div>

    <div className="rounded-lg bg-blue-50 p-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-700">
          Online Transfer
        </span>
        <span className="text-xl">🏦</span>
      </div>

      <h2 className="text-2xl font-bold text-blue-800 mt-3">
        {formatMoney(summary.onlineTransferRevenue)}
      </h2>

      <p className="text-sm text-blue-600 mt-1">
        {Number(summary.onlineTransferSalesCount || 0)} transactions
      </p>
    </div>

    {Number(summary.unknownPaymentSalesCount || 0) > 0 && (
      <div className="rounded-lg bg-gray-100 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Unknown
          </span>
          <span className="text-xl">❔</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-3">
          {formatMoney(summary.unknownPaymentRevenue)}
        </h2>

        <p className="text-sm text-gray-600 mt-1">
          {Number(summary.unknownPaymentSalesCount || 0)} transactions
        </p>
      </div>
    )}
  </div>
</div>

        </>
      )}
    </div>
  );
};

export default Home;
