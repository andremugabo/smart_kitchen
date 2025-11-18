import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert, Button } from "../../components";
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

const AdminDashBoard = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [menuPerformance, setMenuPerformance] = useState(null);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
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

      const [salesRes, menuRes, purchaseRes, overTimeRes] = await Promise.all([
        api.get("/reports/sales-summary", { params }),
        api.get("/reports/menu-performance", { params }),
        api.get("/reports/purchase-summary", { params }),
        api.get("/reports/sales-over-time", { params }),
      ]);

      setSalesSummary(salesRes.data?.data ?? null);
      setMenuPerformance(menuRes.data?.data ?? []);
      setPurchaseSummary(purchaseRes.data?.data ?? null);
      setSalesOverTime(overTimeRes.data?.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchData();
  };

  return (
    <PageShell
      title="Admin dashboard"
      subtitle="Overview of sales, menu performance, and purchases."
    >
      <form
        onSubmit={handleApplyFilters}
        className="flex flex-wrap items-end gap-3 mb-4 text-sm"
      >
        <div>
          <label className="block text-xs text-slate-400 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" className="px-4 py-1 text-xs">
            Apply
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-[11px]"
            onClick={() => {
              const today = new Date();
              const iso = today.toISOString().slice(0, 10);
              setFrom(iso);
              setTo(iso);
              setLoading(true);
              fetchData();
            }}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-[11px]"
            onClick={() => {
              const today = new Date();
              const fromDate = new Date();
              fromDate.setDate(today.getDate() - 6);
              setFrom(fromDate.toISOString().slice(0, 10));
              setTo(today.toISOString().slice(0, 10));
              setLoading(true);
              fetchData();
            }}
          >
            Last 7 days
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-[11px]"
            onClick={() => {
              const today = new Date();
              const fromDate = new Date();
              fromDate.setDate(today.getDate() - 29);
              setFrom(fromDate.toISOString().slice(0, 10));
              setTo(today.toISOString().slice(0, 10));
              setLoading(true);
              fetchData();
            }}
          >
            Last 30 days
          </Button>
        </div>
      </form>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card title="Sales summary">
            {salesSummary ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-400">Total orders: </span>
                  <span className="font-semibold">{salesSummary.totalOrders}</span>
                </p>
                <p>
                  <span className="text-slate-400">Total revenue: </span>
                  <span className="font-semibold">
                    {salesSummary.totalRevenue}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No sales data available.</p>
            )}
          </Card>

          <Card title="Top menus">
            {Array.isArray(menuPerformance) && menuPerformance.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {menuPerformance.slice(0, 5).map((m) => (
                  <li
                    key={m.menuId}
                    className="flex justify-between gap-3"
                  >
                    <span className="truncate">{m.name}</span>
                    <span className="text-slate-300">
                      {m.quantitySold} sold
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                No menu performance data available.
              </p>
            )}
          </Card>

          <Card title="Purchases summary">
            {purchaseSummary ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-400">Total purchases: </span>
                  <span className="font-semibold">
                    {purchaseSummary.totalPurchases}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Total spend: </span>
                  <span className="font-semibold">
                    {purchaseSummary.totalSpend}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No purchase data available.
              </p>
            )}
          </Card>
        </div>

        <Card title="Top menus (chart)">
          {Array.isArray(menuPerformance) && menuPerformance.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={menuPerformance.slice(0, 10)}
                  margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#1f2937",
                      color: "#e5e7eb",
                    }}
                  />
                  <Bar dataKey="quantitySold" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No menu performance data available for chart.
            </p>
          )}
        </Card>

        <Card title="Sales over time">
          {Array.isArray(salesOverTime) && salesOverTime.length > 0 ? (
            <div className="w-full h-64">
              <p className="mb-2 text-xs text-slate-400">
                Total revenue in range:{" "}
                <span className="text-emerald-400 font-semibold">
                  {salesOverTime
                    .reduce((sum, p) => sum + Number(p.totalRevenue || 0), 0)
                    .toFixed(2)}
                </span>
              </p>
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
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#1f2937",
                      color: "#e5e7eb",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No time-series sales data available.
            </p>
          )}
        </Card>
        </>
      )}
    </PageShell>
  );
};

export default AdminDashBoard;