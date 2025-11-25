import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert, Button } from "../../components";

const STATUS_OPTIONS = [
  "pending",
  "preparing",
  "ready",
  "served",
  "completed",
  "canceled",
];

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders");
      setOrders(res.data?.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load orders";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!newStatus) return;
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await loadOrders();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update status";
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "all" || o.status === statusFilter;
    const matchesTable = tableFilter
      ? String(o.table_number ?? "").toLowerCase().includes(tableFilter.toLowerCase())
      : true;
    return matchesStatus && matchesTable;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <PageShell
      title="Orders"
      subtitle="Manage all orders and update their statuses."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Status
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Table
              </label>
              <input
                type="text"
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1"
                placeholder="e.g. T1"
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">ID</th>
                    <th className="px-2 py-2 text-left">Table</th>
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2 text-right">Total</th>
                    <th className="px-2 py-2 text-left">Date</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((o) => {
                    const isPaid = Array.isArray(o.Payments)
                      ? o.Payments.some((p) => p.status === "paid")
                      : false;
                    const orderRef = `ORD-${String(o.id).slice(0, 4).toUpperCase()}`;
                    const customerName = o.User
                      ? o.User.username || o.User.name || o.User.full_name || o.User.email
                      : null;
                    return (
                    <tr
                      key={o.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">
                        <div className="flex flex-col">
                          <span>{orderRef}</span>
                          {(customerName || o.table_number) && (
                            <span className="text-[11px] text-slate-400">
                              {customerName || "Guest"}
                              {o.table_number ? ` · Table ${o.table_number}` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">{o.table_number ?? "-"}</td>
                      <td className="px-2 py-2 capitalize">
                        <div className="flex items-center gap-2">
                          <span>{o.status}</span>
                          <span
                            className={
                              isPaid
                                ? "text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                : "text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/40"
                            }
                          >
                            {isPaid ? "Paid" : "Not paid"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        {Number(o.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2">
                        {o.order_date
                          ? new Date(o.order_date).toLocaleString()
                          : ""}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <select
                          className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs mr-2"
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o.id, e.target.value)
                          }
                          disabled={updatingId === o.id}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          className="text-[11px] px-2 py-1"
                          disabled={updatingId === o.id}
                          onClick={() => loadOrders()}
                        >
                          Refresh
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-[11px] px-2 py-1 ml-2"
                          onClick={() => navigate(`/app/admin/orders/${o.id}`)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default AdminOrdersPage;
