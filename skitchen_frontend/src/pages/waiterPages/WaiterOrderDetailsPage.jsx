import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert, Button } from "../../components";

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
    load();
  }, [id]);

  const items = order?.OrderDetails || [];

  return (
    <PageShell
      title={`Order #${id}`}
      subtitle="View your order items as cards."
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

export default WaiterOrderDetailsPage;
