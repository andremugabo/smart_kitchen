import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageShell, Card, Spinner, Alert, Button } from "../../components";
import { getMenu, getMenuProfit } from "../../services/menuService";
import { listRecipesByMenu } from "../../services/recipeService";

const AdminMenuDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [profitInfo, setProfitInfo] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [menuRes, profitRes, recipesRes] = await Promise.all([
          getMenu(id),
          getMenuProfit(id),
          listRecipesByMenu(id),
        ]);
        setMenu(menuRes.data || null);
        setProfitInfo(profitRes.data || null);
        setRecipes(recipesRes.data || []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load menu details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const cost = profitInfo?.cost ?? 0;
  const price = profitInfo?.price ?? menu?.price ?? 0;
  const profit = profitInfo?.profit ?? price - cost;
  const margin = profitInfo?.margin ?? (price > 0 ? profit / price : 0);

  return (
    <PageShell
      title={menu?.name || "Menu details"}
      subtitle="Menu information, recipes and profitability."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : !menu ? (
        <Card>
          <p className="text-sm text-slate-400">Menu not found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="flex justify-between items-start gap-4 text-sm">
              <div>
                <h2 className="font-semibold text-slate-100 mb-1">Menu info</h2>
                <p className="text-slate-300 mb-1">{menu.description || "No description"}</p>
                <div className="text-[11px] text-slate-400 space-y-1 mt-2">
                  <p>Price: <span className="text-slate-100">{price}</span></p>
                  <p>Cost: <span className="text-slate-100">{cost.toFixed ? cost.toFixed(2) : cost}</span></p>
                  <p>Profit: <span className="text-slate-100">{profit.toFixed ? profit.toFixed(2) : profit}</span></p>
                  <p>Margin: <span className="text-slate-100">{(margin * 100).toFixed(1)}%</span></p>
                  <p>Status: {menu.is_active ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Inactive</span>}</p>
                  <p>Kitchen item: {menu.is_kitchen_item ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {menu.picture && (
                  <img
                    src={
                      menu.picture.startsWith("http")
                        ? menu.picture
                        : (() => {
                            const rawBase = import.meta.env.VITE_API_BASE_URL || "";
                            const base = rawBase.endsWith("/api")
                              ? rawBase.slice(0, -4)
                              : rawBase;
                            const cleanedPath = menu.picture.replace(/^\//, "");
                            return `${base}/${cleanedPath}`;
                          })()
                    }
                    alt={menu.name}
                    className="w-32 h-32 object-cover rounded-md border border-slate-800"
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px] mt-2"
                  onClick={() => navigate("/app/admin/recipes", { state: { menuId: id, menuName: menu.name } })}
                >
                  Create recipe for this menu
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px] mt-2"
                  onClick={() => navigate("/app/admin/menus")}
                >
                  Back to menus
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-100 mb-3 text-sm">Recipes for this menu</h2>
            {recipes.length === 0 ? (
              <p className="text-sm text-slate-400">No recipes linked to this menu.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-300">
                      <th className="px-2 py-2 text-left">Product</th>
                      <th className="px-2 py-2 text-right">Quantity required</th>
                      <th className="px-2 py-2 text-left">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-900 hover:bg-slate-900/40"
                      >
                        <td className="px-2 py-2">{r.Product?.name || "-"}</td>
                        <td className="px-2 py-2 text-right">{r.quantity_required ?? 0}</td>
                        <td className="px-2 py-2">{r.Unit?.name || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  );
};

export default AdminMenuDetailsPage;
