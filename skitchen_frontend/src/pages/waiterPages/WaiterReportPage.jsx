import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert } from "../../components";
import api from "../../services/api";

const WaiterReportPage = () => {
  const [summary, setSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, overTimeRes] = await Promise.all([
          api.get("/reports/sales-summary"),
          api.get("/reports/sales-over-time"),
        ]);

        setSummary(summaryRes.data?.data ?? null);
        setSalesOverTime(overTimeRes.data?.data ?? []);
      } catch (err) {
        const msg =
          err?.response?.status === 403
            ? "You are not allowed to view these reports. Contact a manager or admin."
            : err?.response?.data?.error || "Failed to load report";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalOrders = summary?.totalOrders || 0;
  const daysCount = Array.isArray(salesOverTime) && salesOverTime.length > 0
    ? salesOverTime.length
    : 0;
  const avgOrdersPerDay = daysCount > 0
    ? (totalOrders / daysCount).toFixed(1)
    : "0.0";

  return (
    <PageShell
      title="Waiter Reports"
      subtitle="High level summary of served orders"
    >
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : !summary ? (
        <Card>
          <p className="text-sm text-slate-400">
            No summary data is available.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <p className="text-xs text-slate-400 uppercase mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-emerald-400">{totalOrders}</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-400 uppercase mb-1">Average Orders / Day</p>
              <p className="text-2xl font-bold text-emerald-400">{avgOrdersPerDay}</p>
            </Card>
          </div>

          <Card title="Orders per Day">
            {Array.isArray(salesOverTime) && salesOverTime.length > 0 ? (
              <ul className="text-sm space-y-1">
                {salesOverTime.map((d) => (
                  <li
                    key={d.date}
                    className="flex items-center justify-between border-b border-slate-800/60 py-1 last:border-b-0"
                  >
                    <span className="text-slate-300">{d.date}</span>
                    <span className="font-semibold text-emerald-400">
                      {d.totalOrders || 0} orders
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                No per-day order data available.
              </p>
            )}
          </Card>
        </>
      )}
    </PageShell>
  );
};

export default WaiterReportPage;
