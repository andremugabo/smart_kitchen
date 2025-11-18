import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert } from "../../components";
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

const ManagerDashboard = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [salesRes, purchaseRes, overTimeRes] = await Promise.all([
        api.get("/reports/sales-summary", { params }),
        api.get("/reports/purchase-summary", { params }),
        api.get("/reports/sales-over-time", { params }),
      ]);
      setSalesSummary(salesRes.data?.data ?? null);
      setPurchaseSummary(purchaseRes.data?.data ?? null);
      setSalesOverTime(overTimeRes.data?.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load manager dashboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <PageShell
      title="Manager dashboard"
      subtitle="Overview of sales and purchasing for operational decisions."
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
              load();
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
              load();
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
              load();
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
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card title="Sales summary">
            {salesSummary ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-400">Total orders: </span>
                  <span className="font-semibold">{salesSummary.totalOrders}</span>
                </p>
                <p>
                  <span className="text-slate-400">Total revenue: </span>
                  <span className="font-semibold">{salesSummary.totalRevenue}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No sales data available.</p>
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
              <p className="text-sm text-slate-400">No purchase data available.</p>
            )}
          </Card>
        </div>

        {salesSummary && purchaseSummary && (
          <Card title="Revenue vs spend">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Revenue", value: salesSummary.totalRevenue },
                    { name: "Spend", value: purchaseSummary.totalSpend },
                  ]}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#1f2937",
                      color: "#e5e7eb",
                    }}
                  />
                  <Bar dataKey="value" fill="#fb923c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {Array.isArray(salesOverTime) && salesOverTime.length > 0 && (
          <Card title="Sales over time">
            <div className="w-full h-64">
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
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        </>
      )}
    </PageShell>
  );
};

export default ManagerDashboard;