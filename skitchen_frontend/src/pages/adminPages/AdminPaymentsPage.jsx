import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Button } from "../../components";
import api from "../../services/api";
import { listPayments } from "../../services/paymentService";
import { fetchSettings } from "../../services/settingsService";

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [currency, setCurrency] = useState("RWF");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [settings, res] = await Promise.all([
          fetchSettings(),
          listPayments({ page: 1, limit: 200 }),
        ]);
        if (settings?.currency) setCurrency(settings.currency);
        setPayments(res.data || []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load payments";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = payments.filter((p) => {
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    const date = p.payment_date ? new Date(p.payment_date) : null;
    if (from && date && date < new Date(from)) return false;
    if (to && date && date > new Date(to)) return false;
    return true;
  });

  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const openReportPdf = async () => {
    try {
      const res = await api.get("/payments/report/pdf", {
        params: { from: from || undefined, to: to || undefined },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to open payments report PDF", err);
    }
  };

  return (
    <PageShell
      title="Payments"
      subtitle="All recorded payments with filters and receipt access."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-end gap-3 mb-4 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Method</label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px]"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile</option>
                <option value="tab">Tab</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Status</label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] text-slate-300">
                Showing {filtered.length} payments, total {currency} {totalAmount.toFixed(2)}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="px-3 py-1 text-[11px]"
                onClick={openReportPdf}
              >
                Download report (PDF)
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No payments match the current filters.</p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-1 text-left">Date</th>
                    <th className="px-2 py-1 text-left">Payment</th>
                    <th className="px-2 py-1 text-left">Order</th>
                    <th className="px-2 py-1 text-left">Method</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-right">Amount</th>
                    <th className="px-2 py-1 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const order = p.Order;
                    const paymentRef = `PAY-${String(p.id).slice(0, 4).toUpperCase()}`;
                    const orderRef = order
                      ? `ORD-${String(order.id).slice(0, 4).toUpperCase()}`
                      : `ORD-${String(p.order_id).slice(0, 4).toUpperCase()}`;
                    const customerName = order && order.User
                      ? order.User.username || order.User.name || order.User.full_name || order.User.email
                      : null;
                    const tableNumber = order ? order.table_number : null;
                    return (
                    <tr key={p.id} className="border-b border-slate-900">
                      <td className="px-2 py-1">
                        {p.payment_date ? new Date(p.payment_date).toLocaleString() : "-"}
                      </td>
                      <td className="px-2 py-1 text-xs">
                        <span>{paymentRef}</span>
                      </td>
                      <td className="px-2 py-1 text-xs">
                        <div className="flex flex-col">
                          <span>{orderRef}</span>
                          {(customerName || tableNumber) && (
                            <span className="text-[10px] text-slate-400">
                              {customerName || "Guest"}
                              {tableNumber ? ` · Table ${tableNumber}` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 capitalize">{p.method}</td>
                      <td className="px-2 py-1 capitalize">{p.status}</td>
                      <td className="px-2 py-1 text-right">
                        {currency} {Number(p.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px]"
                          onClick={async () => {
                            try {
                              const res = await api.get(`/payments/${p.id}/receipt`, {
                                responseType: "blob",
                              });
                              const blob = new Blob([res.data], { type: "application/pdf" });
                              const blobUrl = URL.createObjectURL(blob);
                              window.open(blobUrl, "_blank", "noopener,noreferrer");
                            } catch (err) {
                              console.error("Failed to open payment receipt PDF", err);
                            }
                          }}
                        >
                          Receipt
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

export default AdminPaymentsPage;
