import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert } from "../../components";

const ChefDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/orders/kitchen");
        setOrders(res.data?.data ?? []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load menu performance";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageShell
      title="Chef dashboard"
      subtitle="Active orders for the kitchen, grouped by status."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Pending orders">
            {orders.filter((o) => o.status === "pending").length > 0 ? (
              <ul className="space-y-1 text-sm">
                {orders
                  .filter((o) => o.status === "pending")
                  .map((o) => (
                    <li key={o.id} className="border-b border-slate-800 pb-1">
                      <div className="flex justify-between">
                        <span>Order #{o.id}</span>
                        <span className="text-slate-300">
                          Table {o.tableNumber ?? "-"}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-300 mt-1">
                        {o.items.map((it) => (
                          <li key={it.id}>
                            {it.quantity}x {it.name}
                            {it.kitchenNote && (
                              <span className="text-slate-400"> — {it.kitchenNote}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No pending orders.</p>
            )}
          </Card>

          <Card title="In-progress orders">
            {orders.filter((o) => o.status === "in_progress").length > 0 ? (
              <ul className="space-y-1 text-sm">
                {orders
                  .filter((o) => o.status === "in_progress")
                  .map((o) => (
                    <li key={o.id} className="border-b border-slate-800 pb-1">
                      <div className="flex justify-between">
                        <span>Order #{o.id}</span>
                        <span className="text-slate-300">
                          Table {o.tableNumber ?? "-"}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-300 mt-1">
                        {o.items.map((it) => (
                          <li key={it.id}>
                            {it.quantity}x {it.name}
                            {it.kitchenNote && (
                              <span className="text-slate-400"> — {it.kitchenNote}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No in-progress orders.</p>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  );
};

export default ChefDashboard;