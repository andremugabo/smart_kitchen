import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { listMenus } from "../../services/menuService";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import { listPayments, createPayment } from "../../services/paymentService";

const resolvePictureUrl = (picture) => {
  if (!picture) return null;
  if (picture.startsWith("http")) return picture;
  const rawBase = import.meta.env.VITE_API_BASE_URL || "";
  const base = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
  const cleanedPath = picture.replace(/^\//, "");
  return `${base}/${cleanedPath}`;
};

const ManagerOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changeRequests, setChangeRequests] = useState([]);
  const [changeRequestsLoading, setChangeRequestsLoading] = useState(false);
  const [changeRequestsError, setChangeRequestsError] = useState("");
  const [changeRequestsActionId, setChangeRequestsActionId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsMeta, setPaymentsMeta] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [paySaving, setPaySaving] = useState(false);
  const [menus, setMenus] = useState([]);
  const [adding, setAdding] = useState(false);
  const [addMenuId, setAddMenuId] = useState("");
  const [addQuantity, setAddQuantity] = useState("1");
  const [addNote, setAddNote] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data?.data || null);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load order";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    const loadPayments = async () => {
      setPaymentsLoading(true);
      setPaymentsError("");
      try {
        const res = await listPayments({ orderId: id, page: 1, limit: 50 });
        setPayments(res.data || []);
        setPaymentsMeta(res.meta || null);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load payments";
        setPaymentsError(msg);
      } finally {
        setPaymentsLoading(false);
      }
    };

    const loadChangeRequests = async () => {
      setChangeRequestsLoading(true);
      setChangeRequestsError("");
      try {
        const res = await api.get("/order-change-requests", {
          params: { order_id: id },
        });
        setChangeRequests(res.data?.data || []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load change requests";
        setChangeRequestsError(msg);
      } finally {
        setChangeRequestsLoading(false);
      }
    };
    const loadMenus = async () => {
      try {
        const res = await listMenus({ page: 1, limit: 200 });
        setMenus(res.data || []);
      } catch (err) {
        // keep non-fatal
      }
    };

    loadOrder();
    loadPayments();
    loadChangeRequests();
    loadMenus();
  }, [id]);

  const items = order?.OrderDetails || [];
  const totalAmount = Number(order?.total_amount || 0);
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const outstanding = Math.max(0, totalAmount - totalPaid);
  const status = order?.status || "";
  const canAddItems =
    status !== "served" && status !== "completed" && status !== "canceled";

  const shortRef = order
    ? `ORD-${String(order.id).slice(0, 4).toUpperCase()}`
    : `#${id}`;

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!order?.id) return;
    const quantityNum = Number(addQuantity || 0);
    if (!addMenuId || !quantityNum || Number.isNaN(quantityNum) || quantityNum <= 0) {
      setPaymentsError("Select a menu and enter a valid quantity.");
      return;
    }

    setPaymentsError("");
    setAdding(true);
    try {
      await api.post(`/orders/${order.id}/items`, {
        items: [
          {
            menu_id: addMenuId,
            quantity: quantityNum,
            kitchen_note: addNote || undefined,
          },
        ],
      });

      await refreshAll();
      setAddMenuId("");
      setAddQuantity("1");
      setAddNote("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to add item";
      setPaymentsError(msg);
    } finally {
      setAdding(false);
    }
  };

  const refreshAll = async () => {
    try {
      const [orderRes, paymentsRes, changesRes] = await Promise.all([
        api.get(`/orders/${id}`),
        listPayments({ orderId: id, page: 1, limit: 50 }),
        api.get("/order-change-requests", { params: { order_id: id } }),
      ]);
      setOrder(orderRes.data?.data || null);
      setPayments(paymentsRes.data || []);
      setPaymentsMeta(paymentsRes.meta || null);
      setChangeRequests(changesRes.data?.data || []);
    } catch (err) {
      // keep individual errors handled where they occur
    }
  };

  const handleChangeRequestAction = async (requestId, action) => {
    if (!requestId || !action) return;
    setChangeRequestsActionId(requestId);
    setChangeRequestsError("");
    try {
      if (action === "approve") {
        await api.post(`/order-change-requests/${requestId}/approve`, {
          response_message: "Approved by manager",
        });
      } else {
        await api.post(`/order-change-requests/${requestId}/reject`, {
          response_message: "Rejected by manager",
        });
      }
      await refreshAll();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to process change request";
      setChangeRequestsError(msg);
    } finally {
      setChangeRequestsActionId(null);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!order?.id) return;
    const amountNum = payAmount ? Number(payAmount) : outstanding;
    if (!amountNum || Number.isNaN(amountNum) || amountNum <= 0) {
      setPaymentsError("Enter a valid payment amount.");
      return;
    }
    setPaySaving(true);
    setPaymentsError("");
    try {
      await createPayment({
        order_id: order.id,
        amount: amountNum,
        method: payMethod,
        status: "paid",
      });
      setPayAmount("");
      const res = await listPayments({ orderId: order.id, page: 1, limit: 50 });
      setPayments(res.data || []);
      setPaymentsMeta(res.meta || null);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to create payment";
      setPaymentsError(msg);
    } finally {
      setPaySaving(false);
    }
  };

  return (
    <PageShell
      title={`Order ${shortRef}`}
      subtitle="View order details and menu items as cards."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : !order ? (
        <Card>
          <p className="text-sm text-slate-400">Order not found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <div>
                <p className="text-slate-300">
                  <span className="text-slate-400">Table:</span>{" "}
                  {order.table_number || "-"}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400">Status:</span>{" "}
                  <span className="capitalize">{order.status || "-"}</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400">Date:</span>{" "}
                  {order.order_date
                    ? new Date(order.order_date).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-slate-300">
                  <span className="text-slate-400">Total:</span>{" "}
                  {Number(order.total_amount || 0).toFixed(2)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px]"
                  onClick={async () => {
                    try {
                      const res = await api.get(`/orders/${order.id}/receipt`, {
                        responseType: "blob",
                      });
                      const blob = new Blob([res.data], { type: "application/pdf" });
                      const blobUrl = URL.createObjectURL(blob);
                      window.open(blobUrl, "_blank", "noopener,noreferrer");
                    } catch (err) {
                      console.error("Failed to open order receipt PDF", err);
                    }
                  }}
                >
                  Order receipt (PDF)
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-100">Order change requests</h2>
              <Button
                type="button"
                variant="ghost"
                className="px-3 py-1 text-[11px]"
                onClick={refreshAll}
              >
                Refresh
              </Button>
            </div>

            {changeRequestsError && (
              <Alert variant="error" className="mb-2 text-[11px]">
                {changeRequestsError}
              </Alert>
            )}

            {changeRequestsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner className="w-5 h-5" />
              </div>
            ) : changeRequests.length === 0 ? (
              <p className="text-sm text-slate-400">No change requests for this order.</p>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-300">
                      <th className="px-2 py-1 text-left">Type</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Reason</th>
                      <th className="px-2 py-1 text-left">Item</th>
                      <th className="px-2 py-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changeRequests.map((r) => {
                      const detail = r.OrderDetail || {};
                      const typeLabel =
                        r.type === "void_order"
                          ? "Void order"
                          : r.type === "cancel_order"
                          ? "Cancel order"
                          : "Remove item";
                      const statusLabel = r.status || "-";
                      const itemLabel = detail.id
                        ? `Item x${detail.quantity || "?"}`
                        : "-";

                      const isPending = r.status === "pending";

                      return (
                        <tr key={r.id} className="border-b border-slate-900">
                          <td className="px-2 py-1">{typeLabel}</td>
                          <td className="px-2 py-1 capitalize">{statusLabel}</td>
                          <td className="px-2 py-1 text-slate-400 max-w-xs truncate">
                            {r.reason || "-"}
                          </td>
                          <td className="px-2 py-1">{itemLabel}</td>
                          <td className="px-2 py-1 text-right">
                            {isPending ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-2 py-1 text-[11px]"
                                  disabled={changeRequestsActionId === r.id}
                                  onClick={() => handleChangeRequestAction(r.id, "approve")}
                                >
                                  {changeRequestsActionId === r.id
                                    ? "Processing..."
                                    : "Approve"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="px-2 py-1 text-[11px]"
                                  disabled={changeRequestsActionId === r.id}
                                  onClick={() => handleChangeRequestAction(r.id, "reject")}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                {r.response_message || "Processed"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-100">Payments</h2>
              <div className="flex flex-wrap items-center gap-2 justify-end text-[11px]">
                <form
                  onSubmit={handleAddItem}
                  className="flex flex-wrap items-center gap-2 text-[11px] mr-4"
                >
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1"
                    value={addMenuId}
                    onChange={(e) => setAddMenuId(e.target.value)}
                    disabled={!canAddItems}
                  >
                    <option value="">Add menu...</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    label="Qty"
                    type="number"
                    className="w-20"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    disabled={!canAddItems}
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs"
                    value={addNote}
                    onChange={(e) => setAddNote(e.target.value)}
                    disabled={!canAddItems}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="px-3 py-1 text-[11px]"
                    disabled={adding || !canAddItems}
                  >
                    {adding ? "Adding..." : "Add item"}
                  </Button>
                </form>
                {!canAddItems && (
                  <span className="text-[10px] text-slate-500">
                    Order is {status || "updated"}; cannot add more items.
                  </span>
                )}
                <div className="text-[11px] text-slate-300 text-right space-y-0.5">
                  <div>
                    Total: <span className="font-semibold">{totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    Paid: <span className="text-emerald-400">{totalPaid.toFixed(2)}</span>
                  </div>
                  <div>
                    Outstanding: <span className={outstanding > 0 ? "text-orange-300" : "text-emerald-400"}>{outstanding.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            {paymentsError && (
              <Alert variant="error" className="mb-2 text-[11px]">
                {paymentsError}
              </Alert>
            )}

            {paymentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner className="w-5 h-5" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-sm text-slate-400 mb-3">No payments recorded for this order yet.</p>
            ) : (
              <div className="overflow-x-auto mb-3 text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-300">
                      <th className="px-2 py-1 text-left">Date</th>
                      <th className="px-2 py-1 text-left">Method</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-right">Amount</th>
                      <th className="px-2 py-1 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-slate-900">
                        <td className="px-2 py-1">
                          {p.payment_date
                            ? new Date(p.payment_date).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-2 py-1 capitalize">{p.method}</td>
                        <td className="px-2 py-1 capitalize">{p.status}</td>
                        <td className="px-2 py-1 text-right">
                          {Number(p.amount || 0).toFixed(2)}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form
              onSubmit={handleCreatePayment}
              className="mt-2 border-t border-slate-800 pt-2 grid md:grid-cols-3 gap-2 text-[11px]"
            >
              <Input
                label="Amount"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={outstanding > 0 ? outstanding.toFixed(2) : "0.00"}
              />
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Method
                </label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full text-[11px]"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile</option>
                  <option value="tab">Tab</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="submit"
                  className="px-3 py-1 text-[11px]"
                  disabled={paySaving || outstanding <= 0}
                >
                  {outstanding <= 0
                    ? "Fully paid"
                    : paySaving
                    ? "Saving..."
                    : "Add payment"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-100">Items</h2>
              <Button
                type="button"
                variant="ghost"
                className="px-3 py-1 text-[11px]"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-slate-400">No items for this order.</p>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-xs">
                {items.map((d) => {
                  const menu = d.Menu || {};
                  const imgUrl = resolvePictureUrl(menu.picture);
                  const name = menu.name || `Menu #${d.menu_id}`;
                  const priceAtTime = Number(d.price_at_time || 0);
                  const qty = Number(d.quantity || 0);
                  const lineTotal = priceAtTime * qty;

                  return (
                    <div
                      key={d.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-md overflow-hidden"
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={name}
                          className="w-full h-28 object-cover border-b border-slate-800"
                        />
                      ) : (
                        <div className="w-full h-28 flex items-center justify-center text-[11px] text-slate-500 border-b border-slate-800">
                          No image
                        </div>
                      )}
                      <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-100 truncate">
                            {name}
                          </span>
                          <span className="text-emerald-400 text-[11px] font-semibold">
                            {priceAtTime.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Qty: <span>{qty}</span> | Line total:{" "}
                          <span className="text-emerald-400">
                            {lineTotal.toFixed(2)}
                          </span>
                        </p>
                        {d.kitchen_note && (
                          <p className="text-[10px] text-slate-500 line-clamp-2">
                            Note: {d.kitchen_note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  );
};

export default ManagerOrderDetailsPage;
