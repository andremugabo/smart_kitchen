import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { listMenus } from "../../services/menuService";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";

const resolvePictureUrl = (picture) => {
  if (!picture) return null;
  if (picture.startsWith("http")) return picture;
  const rawBase = import.meta.env.VITE_API_BASE_URL || "";
  const base = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
  const cleanedPath = picture.replace(/^\//, "");
  return `${base}/${cleanedPath}`;
};

const WaiterOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [menus, setMenus] = useState([]);
  const [adding, setAdding] = useState(false);
  const [addMenuId, setAddMenuId] = useState("");
  const [addQuantity, setAddQuantity] = useState("1");
  const [addNote, setAddNote] = useState("");

  useEffect(() => {
    const load = async () => {
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
    const loadMenus = async () => {
      try {
        const res = await listMenus({ page: 1, limit: 200 });
        setMenus(res.data || []);
      } catch (err) {
        // keep non-fatal
      }
    };

    load();
    loadMenus();
  }, [id]);

  const requestCancelOrder = async () => {
    if (!order?.id) return;
    setError("");
    setActionMessage("");
    setSubmittingId("order");
    try {
      await api.post("/order-change-requests", {
        order_id: order.id,
        type: "cancel_order",
      });
      setActionMessage("Cancel request sent to manager/admin.");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to request cancel";
      setError(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  const requestRemoveItem = async (detailId) => {
    if (!order?.id || !detailId) return;
    setError("");
    setActionMessage("");
    setSubmittingId(detailId);
    try {
      await api.post("/order-change-requests", {
        order_id: order.id,
        order_detail_id: detailId,
        type: "remove_item",
      });
      setActionMessage("Item removal request sent to manager/admin.");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to request item removal";
      setError(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  const items = order?.OrderDetails || [];
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
      setError("Select a menu and enter a valid quantity.");
      return;
    }

    setError("");
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

      // Reload order details so the new item appears
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data?.data || null);

      setAddMenuId("");
      setAddQuantity("1");
      setAddNote("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to add item";
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <PageShell
      title={`Order ${shortRef}`}
      subtitle="View your order items as cards."
    >
      {error && <Alert variant="error">{error}</Alert>}
      {actionMessage && !error && (
        <Alert variant="success">{actionMessage}</Alert>
      )}

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
              <div className="text-right">
                <p className="text-slate-300">
                  <span className="text-slate-400">Total:</span>{" "}
                  {Number(order.total_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-100">Items</h2>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <form
                  onSubmit={handleAddItem}
                  className="flex flex-wrap items-center gap-2 text-[11px]"
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
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 py-1 text-[11px]"
                  disabled={submittingId === "order"}
                  onClick={requestCancelOrder}
                >
                  {submittingId === "order" ? "Requesting..." : "Request cancel order"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px]"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
              </div>
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
                        <div className="flex justify-end mt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-2 py-1 text-[11px]"
                            disabled={submittingId === d.id}
                            onClick={() => requestRemoveItem(d.id)}
                          >
                            {submittingId === d.id
                              ? "Requesting..."
                              : "Request remove item"}
                          </Button>
                        </div>
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

export default WaiterOrderDetailsPage;
