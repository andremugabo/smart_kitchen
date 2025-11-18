import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert } from "../../components";

const WaiterDashboard = () => {
  const [stats, setStats] = useState({ tablesAssigned: 0, openOrdersCount: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/orders/waiter/current");
        const data = res.data?.data ?? {};
        setStats(data.stats ?? { tablesAssigned: 0, openOrdersCount: 0 });
        setOrders(data.openOrders ?? []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load waiter dashboard";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageShell
      title="Waiter dashboard"
      subtitle="Quick glance at your tables and open orders."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card title="Tables assigned">
              <p className="text-3xl font-semibold text-emerald-400">
                {stats.tablesAssigned}
              </p>
            </Card>
            <Card title="Open orders">
              <p className="text-3xl font-semibold text-orange-300">
                {stats.openOrdersCount}
              </p>
            </Card>
            <Card title="Tips & performance">
              <p className="text-sm text-slate-300">
                Metrics for tips and performance can be added here later.
              </p>
            </Card>
          </div>

          <Card title="Open orders">
            {orders.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {orders.map((o) => (
                  <li key={o.id} className="border-b border-slate-800 pb-1">
                    <div className="flex justify-between">
                      <span>Order #{o.id}</span>
                      <span className="text-slate-300">
                        Table {o.tableNumber ?? "-"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Status: {o.status}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                You have no open orders at the moment.
              </p>
            )}
          </Card>
        </>
      )}
    </PageShell>
  );
};

export default WaiterDashboard;