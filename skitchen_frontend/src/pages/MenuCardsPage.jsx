import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageShell, Card, Spinner, Alert, Button } from "../components";
import { listMenus } from "../services/menuService";

const MenuCardsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fromOrder = Boolean(location.state?.fromOrder);
  const pathParts = location.pathname.split("/").filter(Boolean);
  const roleSegment = pathParts[1] || ""; // '/app/{role}/menus-cards'

  const titleByRole = {
    admin: "Menus (cards)",
    manager: "Menus (cards)",
    chef: "Menus (cards)",
    waiter: "Menus (cards)",
  };

  const subtitleByRole = {
    admin: "Browse menus as cards.",
    manager: "Browse menus as cards.",
    chef: "Browse menus as cards.",
    waiter: fromOrder
      ? "Tap a menu card to add it to the current order."
      : "Browse menus as cards.",
  };

  const canAddToOrder = fromOrder && roleSegment === "waiter";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await listMenus({ page: 1, limit: 100 });
        setMenus(res.data || []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load menus";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resolvePictureUrl = (picture) => {
    if (!picture) return null;
    if (picture.startsWith("http")) return picture;
    const rawBase = import.meta.env.VITE_API_BASE_URL || "";
    const base = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
    const cleanedPath = picture.replace(/^\//, "");
    return `${base}/${cleanedPath}`;
  };

  const handleCardClick = (menuId) => {
    if (!canAddToOrder) return;
    // Store selected menu ID for the order creation page to pick up
    localStorage.setItem("pendingOrderMenuId", String(menuId));
    navigate(-1);
  };

  const pageTitle = titleByRole[roleSegment] || "Menus (cards)";
  const pageSubtitle = subtitleByRole[roleSegment] || "Browse menus as cards.";

  return (
    <PageShell title={pageTitle} subtitle={pageSubtitle}>
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          {menus.length === 0 ? (
            <p className="text-sm text-slate-400">No menus found.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-xs">
              {menus.map((m) => {
                const price = Number(m.price || 0);
                const cost = Number(m.estimated_cost || 0);
                const profit = price - cost;
                const margin = price > 0 ? (profit / price) * 100 : 0;
                const imgUrl = resolvePictureUrl(m.picture);

                return (
                  <button
                    key={m.id}
                    type="button"
                    className="text-left bg-slate-950/60 border border-slate-800 rounded-md overflow-hidden hover:border-slate-600 transition-colors"
                    onClick={() => handleCardClick(m.id)}
                    disabled={!canAddToOrder}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={m.name}
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
                          {m.name}
                        </span>
                        <span className="text-emerald-400 text-[11px] font-semibold">
                          {price.toFixed(2)}
                        </span>
                      </div>
                      {m.estimated_cost != null && (
                        <p className="text-[10px] text-slate-400">
                          Cost: <span>{cost.toFixed(2)}</span> | Profit: {" "}
                          <span className={profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {profit.toFixed(2)}
                          </span>{" "}
                          ({margin.toFixed(1)}%)
                        </p>
                      )}
                      {m.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-2">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {fromOrder && !canAddToOrder && (
            <p className="mt-3 text-[11px] text-slate-500">
              This view was opened from an order, but adding to orders is only enabled for the waiter role.
            </p>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default MenuCardsPage;
