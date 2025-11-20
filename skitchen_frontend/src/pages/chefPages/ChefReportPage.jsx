import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert } from "../../components";
import api from "../../services/api";

const ChefReportPage = () => {
  const [summary, setSummary] = useState(null);
  const [menuPerformance, setMenuPerformance] = useState([]);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, menuRes, overTimeRes] = await Promise.all([
          api.get("/reports/sales-summary"),
          api.get("/reports/menu-performance"),
          api.get("/reports/sales-over-time"),
        ]);

        setSummary(summaryRes.data?.data ?? null);
        setMenuPerformance(menuRes.data?.data ?? []);
        setSalesOverTime(overTimeRes.data?.data ?? []);
      } catch (err) {
        const msg =
          err?.response?.status === 403
            ? "You are not allowed to view these reports. Contact a manager or admin."
            : err?.response?.data?.error || "Failed to load chef reports";
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
      title="Chef Reports"
      subtitle="High level summary of orders prepared"
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Orders per Day">
              {Array.isArray(salesOverTime) && salesOverTime.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {salesOverTime.map((d) => (
                    <li
                      key={d.date}
                      className="border-b border-slate-800/60 py-1 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">{d.date}</span>
                        <span className="font-semibold text-emerald-400">
                          {d.totalOrders || 0} orders
                        </span>
                      </div>
                      {d.statusCounts && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(d.statusCounts).map(
                            ([status, count]) => (
                              <span
                                key={status}
                                className="px-2 py-0.5 rounded-full text-[11px] bg-slate-900 text-slate-200"
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
              ) : (
                <p className="text-sm text-slate-400">
                  No per-day order data available.
                </p>
              )}
            </Card>

            <Card title="Top Dishes (by quantity)">
              {Array.isArray(menuPerformance) && menuPerformance.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {menuPerformance
                    .slice()
                    .sort((a, b) => (b.quantitySold || 0) - (a.quantitySold || 0))
                    .slice(0, 10)
                    .map((m, idx) => (
                      <li
                        key={m.menuId || m.name || idx}
                        className="flex items-center justify-between border-b border-slate-800/60 py-1 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-5 text-right">
                            #{idx + 1}
                          </span>
                          <span className="text-slate-200">{m.name}</span>
                        </div>
                        <span className="font-semibold text-emerald-400">
                          {m.quantitySold || 0} sold
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No dish performance data available.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
};

export default ChefReportPage;
