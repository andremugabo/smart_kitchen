import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert } from "../../components";
import api from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const AdminReportPage = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [menuPerformance, setMenuPerformance] = useState([]);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [salesRes, menuRes, purchaseRes, overTimeRes, paymentsSummaryRes] =
        await Promise.all([
          api.get("/reports/sales-summary", { params }),
          api.get("/reports/menu-performance", { params }),
          api.get("/reports/purchase-summary", { params }),
          api.get("/reports/sales-over-time", { params }),
          api.get("/payments/summary", { params }),
        ]);

      setSalesSummary(salesRes.data?.data ?? null);
      setMenuPerformance(menuRes.data?.data ?? []);
      setPurchaseSummary(purchaseRes.data?.data ?? null);
      setSalesOverTime(overTimeRes.data?.data ?? []);
      setPaymentSummary(paymentsSummaryRes.data?.data ?? null);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load reports";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchData();
  };

  const profitMargin =
    salesSummary && purchaseSummary
      ? (
          ((salesSummary.totalRevenue - purchaseSummary.totalSpend) /
            (salesSummary.totalRevenue || 1)) *
          100
        ).toFixed(1)
      : 0;

  const totalOrdersCount = paymentSummary?.ordersByStatus
    ? Object.values(paymentSummary.ordersByStatus).reduce(
        (a, b) => a + b,
        0
      )
    : 0;

  return (
    <PageShell
      title="Admin Reports"
      subtitle="Sales, purchases, and payment analytics"
    >
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-800">
        <form
          onSubmit={handleApplyFilters}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-md bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-md bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="ml-auto px-4 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-10 h-10 mx-auto mb-3" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {salesSummary?.totalRevenue
                    ? Number(salesSummary.totalRevenue).toLocaleString()
                    : "0"}
                </p>
                <p className="text-xs text-slate-400">
                  {salesSummary?.totalOrders || 0} orders
                </p>
              </div>
            </Card>

            <Card>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Paid Revenue
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {paymentSummary?.totalRevenue
                    ? Number(paymentSummary.totalRevenue).toLocaleString()
                    : "0"}
                </p>
                <p className="text-xs text-slate-400">
                  {totalOrdersCount} total orders
                </p>
              </div>
            </Card>

            <Card>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Total Spend
                </p>
                <p className="text-2xl font-bold text-orange-400">
                  {purchaseSummary?.totalSpend
                    ? Number(purchaseSummary.totalSpend).toLocaleString()
                    : "0"}
                </p>
                <p className="text-xs text-slate-400">
                  {purchaseSummary?.totalPurchases || 0} purchases
                </p>
              </div>
            </Card>

            <Card>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Net Profit
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {salesSummary && purchaseSummary
                    ? (
                        salesSummary.totalRevenue - purchaseSummary.totalSpend
                      ).toLocaleString()
                    : "0"}
                </p>
                <p className="text-xs text-slate-400">{profitMargin}% margin</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 mb-6">
            <Card title="Top Selling Menus" className="lg:col-span-1">
              {Array.isArray(menuPerformance) && menuPerformance.length > 0 ? (
                <div className="space-y-2">
                  {menuPerformance.slice(0, 8).map((m, idx) => (
                    <div
                      key={m.menuId}
                      className="flex items-center justify-between gap-3 p-2 rounded-md bg-slate-800/30"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-emerald-400 w-6">
                          #{idx + 1}
                        </span>
                        <span className="text-sm truncate">{m.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-300 whitespace-nowrap">
                        {m.quantitySold} sold
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <p className="text-sm">No menu performance data</p>
                </div>
              )}
            </Card>

            <Card title="Menu Performance" className="lg:col-span-2">
              {Array.isArray(menuPerformance) && menuPerformance.length > 0 ? (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={menuPerformance.slice(0, 10)}
                      margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: "#9ca3af", fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          color: "#e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="quantitySold"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-slate-500">
                  <p className="text-sm">No menu performance data</p>
                </div>
              )}
            </Card>
          </div>

          {Array.isArray(salesOverTime) && salesOverTime.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Revenue Over Time">
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesOverTime}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#9ca3af", fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          color: "#e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: "#22c55e", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Orders by Status (per day)">
                <div className="max-h-80 overflow-y-auto text-sm">
                  <ul className="space-y-2">
                    {salesOverTime.map((d) => (
                      <li
                        key={d.date}
                        className="border-b border-slate-800 pb-2 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 text-xs font-medium">
                            {d.date}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {d.totalOrders || 0} orders
                          </span>
                        </div>
                        {d.statusCounts && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(d.statusCounts).map(
                              ([status, count]) => (
                                <span
                                  key={status}
                                  className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-200"
                                >
                                  {status}: {count}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};

export default AdminReportPage;
