import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert, Button } from "../../components";

const ManagerChangeRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/order-change-requests", {
        params: { status: "pending" },
      });
      setRequests(res.data?.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load change requests";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    if (!id || !action) return;
    setActionId(id);
    setError("");
    try {
      if (action === "approve") {
        await api.post(`/order-change-requests/${id}/approve`, {
          response_message: "Approved by manager",
        });
      } else {
        await api.post(`/order-change-requests/${id}/reject`, {
          response_message: "Rejected by manager",
        });
      }
      await loadRequests();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to process request";
      setError(msg);
    } finally {
      setActionId(null);
    }
  };

  return (
    <PageShell
      title="Order change requests"
      subtitle="Review and process pending change requests from waiters."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-400">
              Pending requests: {requests.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1 text-[11px]"
              onClick={loadRequests}
            >
              Refresh
            </Button>
          </div>

          {requests.length === 0 ? (
            <p className="text-sm text-slate-400">
              No pending change requests.
            </p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-1 text-left">Order</th>
                    <th className="px-2 py-1 text-left">Type</th>
                    <th className="px-2 py-1 text-left">Item</th>
                    <th className="px-2 py-1 text-left">Reason</th>
                    <th className="px-2 py-1 text-left">Requested at</th>
                    <th className="px-2 py-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const detail = r.OrderDetail || {};
                    const orderId = r.order_id;
                    const orderRef = orderId
                      ? `ORD-${String(orderId).slice(0, 8).toUpperCase()}`
                      : "-";
                    const typeLabel =
                      r.type === "void_order"
                        ? "Void order"
                        : r.type === "cancel_order"
                        ? "Cancel order"
                        : "Remove item";
                    const itemLabel = detail.id
                      ? `Item x${detail.quantity || "?"}`
                      : "-";
                    const createdAt = r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "-";

                    return (
                      <tr key={r.id} className="border-b border-slate-900">
                        <td className="px-2 py-1">
                          <button
                            type="button"
                            className="text-emerald-400 hover:underline"
                            onClick={() =>
                              orderId &&
                              navigate(`/app/manager/orders/${orderId}`)
                            }
                          >
                            {orderRef}
                          </button>
                        </td>
                        <td className="px-2 py-1">{typeLabel}</td>
                        <td className="px-2 py-1">{itemLabel}</td>
                        <td className="px-2 py-1 text-slate-400 max-w-xs truncate">
                          {r.reason || "-"}
                        </td>
                        <td className="px-2 py-1 text-slate-400">{createdAt}</td>
                        <td className="px-2 py-1 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="px-2 py-1 text-[11px]"
                              disabled={actionId === r.id}
                              onClick={() => handleAction(r.id, "approve")}
                            >
                              {actionId === r.id ? "Processing..." : "Approve"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="px-2 py-1 text-[11px]"
                              disabled={actionId === r.id}
                              onClick={() => handleAction(r.id, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default ManagerChangeRequestsPage;
