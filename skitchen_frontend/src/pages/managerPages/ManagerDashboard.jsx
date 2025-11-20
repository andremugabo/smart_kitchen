import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Cell,
} from "recharts";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [salesSummary, setSalesSummary] = useState(null);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderIdLookup, setOrderIdLookup] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [salesRes, purchaseRes, overTimeRes, paymentsSummaryRes] = await Promise.all([
        api.get("/reports/sales-summary", { params }),
        api.get("/reports/purchase-summary", { params }),
        api.get("/reports/sales-over-time", { params }),
        api.get("/payments/summary", { params }),
      ]);
      setSalesSummary(salesRes.data?.data ?? null);
      setPurchaseSummary(purchaseRes.data?.data ?? null);
      setSalesOverTime(overTimeRes.data?.data ?? []);
      setPaymentSummary(paymentsSummaryRes.data?.data ?? null);
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

  const setDateRange = (range) => {
    const today = new Date();
    const fromDate = new Date();
    
    switch(range) {
      case 'today':
        setFrom(today.toISOString().slice(0, 10));
        setTo(today.toISOString().slice(0, 10));
        break;
      case '7days':
        fromDate.setDate(today.getDate() - 6);
        setFrom(fromDate.toISOString().slice(0, 10));
        setTo(today.toISOString().slice(0, 10));
        break;
      case '30days':
        fromDate.setDate(today.getDate() - 29);
        setFrom(fromDate.toISOString().slice(0, 10));
        setTo(today.toISOString().slice(0, 10));
        break;
      case 'clear':
        setFrom("");
        setTo("");
        break;
    }
  };

  // Calculate profit margin
  const profitMargin = salesSummary && purchaseSummary 
    ? ((salesSummary.totalRevenue - purchaseSummary.totalSpend) / salesSummary.totalRevenue * 100).toFixed(1)
    : 0;

  return (
    <PageShell
      title="Manager Dashboard"
      subtitle="Real-time insights into sales, purchases, and operational metrics"
    >
      {/* Top Action Bar */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date Filters */}
          <form onSubmit={handleApplyFilters} className="flex flex-wrap items-center gap-3">
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
            
            {/* Quick Date Buttons */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <Button
                type="button"
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setDateRange('today');
                  setTimeout(() => load(), 100);
                }}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setDateRange('7days');
                  setTimeout(() => load(), 100);
                }}
              >
                7 Days
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setDateRange('30days');
                  setTimeout(() => load(), 100);
                }}
              >
                30 Days
              </Button>
              {(from || to) && (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1.5 text-xs text-slate-500"
                  onClick={() => {
                    setDateRange('clear');
                    setTimeout(() => load(), 100);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            <Button type="submit" className="px-4 py-1.5 text-sm">
              Apply Filters
            </Button>
          </form>

          {/* Order Lookup & Menu Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by Order ID"
                value={orderIdLookup}
                onChange={(e) => setOrderIdLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && orderIdLookup) {
                    e.preventDefault();
                    navigate(`/app/manager/orders/${orderIdLookup}`);
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Button
                type="button"
                variant="outline"
                className="px-3 py-1.5 text-sm"
                disabled={!orderIdLookup}
                onClick={() => {
                  if (orderIdLookup) {
                    navigate(`/app/manager/orders/${orderIdLookup}`);
                  }
                }}
              >
                Find Order
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1.5 text-sm"
              onClick={() => navigate("/app/manager/menus-cards")}
            >
              Browse Menus
            </Button>
          </div>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Spinner className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Total Revenue */}
            <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-800/30">
              <div className="space-y-1">
                <p className="text-xs text-emerald-400/80 font-medium uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {salesSummary?.totalRevenue ? Number(salesSummary.totalRevenue).toLocaleString() : '0'}
                </p>
                <p className="text-xs text-slate-400">
                  {salesSummary?.totalOrders || 0} orders
                </p>
              </div>
            </Card>

            {/* Total Spend */}
            <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-800/30">
              <div className="space-y-1">
                <p className="text-xs text-orange-400/80 font-medium uppercase tracking-wide">Total Spend</p>
                <p className="text-3xl font-bold text-orange-400">
                  {purchaseSummary?.totalSpend ? Number(purchaseSummary.totalSpend).toLocaleString() : '0'}
                </p>
                <p className="text-xs text-slate-400">
                  {purchaseSummary?.totalPurchases || 0} purchases
                </p>
              </div>
            </Card>

            {/* Profit */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/30">
              <div className="space-y-1">
                <p className="text-xs text-blue-400/80 font-medium uppercase tracking-wide">Net Profit</p>
                <p className="text-3xl font-bold text-blue-400">
                  {salesSummary && purchaseSummary 
                    ? (salesSummary.totalRevenue - purchaseSummary.totalSpend).toLocaleString()
                    : '0'}
                </p>
                <p className="text-xs text-slate-400">
                  {profitMargin}% margin
                </p>
              </div>
            </Card>

            {/* Paid Revenue */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-800/30">
              <div className="space-y-1">
                <p className="text-xs text-purple-400/80 font-medium uppercase tracking-wide">Paid Revenue</p>
                <p className="text-3xl font-bold text-purple-400">
                  {paymentSummary?.totalRevenue ? Number(paymentSummary.totalRevenue).toLocaleString() : '0'}
                </p>
                <p className="text-xs text-slate-400">
                  {paymentSummary?.ordersByStatus ? 
                    Object.values(paymentSummary.ordersByStatus).reduce((a, b) => a + b, 0) : 0} total orders
                </p>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-4 lg:grid-cols-2 mb-6">
            {/* Orders by Status */}
            <Card title="Orders by Status" className="h-full">
              {paymentSummary && paymentSummary.ordersByStatus ? (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(paymentSummary.ordersByStatus).map(
                        ([status, count]) => ({ 
                          status: status.charAt(0).toUpperCase() + status.slice(1), 
                          count 
                        })
                      )}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="status"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
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
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {Object.entries(paymentSummary.ordersByStatus).map(
                          ([status], idx) => {
                            let color = "#64748b";
                            if (status === "completed" || status === "paid") color = "#22c55e";
                            else if (status === "pending" || status === "preparing") color = "#f97316";
                            else if (status === "failed" || status === "canceled") color = "#ef4444";
                            else if (status === "refunded") color = "#3b82f6";
                            return <Cell key={status + idx} fill={color} />;
                          }
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-slate-500">
                  <p className="text-sm">No order status data available</p>
                </div>
              )}
            </Card>

            {/* Revenue by Payment Method */}
            <Card title="Revenue by Payment Method" className="h-full">
              {paymentSummary && paymentSummary.revenueByMethod &&
              Object.keys(paymentSummary.revenueByMethod).length > 0 ? (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(paymentSummary.revenueByMethod).map(
                        ([method, amount]) => ({ 
                          method: method.charAt(0).toUpperCase() + method.slice(1), 
                          amount 
                        })
                      )}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="method"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
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
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {Object.entries(paymentSummary.revenueByMethod).map(
                          ([method], idx) => {
                            let color = "#64748b";
                            if (method === "cash") color = "#22c55e";
                            else if (method === "card") color = "#3b82f6";
                            else if (method === "mobile") color = "#a855f7";
                            else if (method === "tab") color = "#f59e0b";
                            return <Cell key={method + idx} fill={color} />;
                          }
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-slate-500">
                  <p className="text-sm">No payment method data available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-4 lg:grid-cols-2 mb-6">
            {/* Revenue vs Spend */}
            {salesSummary && purchaseSummary && (
              <Card title="Revenue vs Spend Comparison" className="h-full">
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Revenue", value: salesSummary.totalRevenue },
                        { name: "Spend", value: purchaseSummary.totalSpend },
                        { name: "Profit", value: salesSummary.totalRevenue - purchaseSummary.totalSpend },
                      ]}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
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
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#f97316" />
                        <Cell fill="#3b82f6" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Sales Over Time */}
            {Array.isArray(salesOverTime) && salesOverTime.length > 0 && (
              <Card title="Sales Trend Over Time" className="h-full">
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
            )}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default ManagerDashboard;