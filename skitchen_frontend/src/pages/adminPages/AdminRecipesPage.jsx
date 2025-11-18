import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageShell, Card, Spinner, Alert, Input, Button } from "../../components";
import { listRecipes, createRecipe, updateRecipe, deleteRecipe } from "../../services/recipeService";
import { fetchProducts, fetchUnits } from "../../services/productService";
import { listMenus } from "../../services/menuService";

const AdminRecipesPage = () => {
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuId, setMenuId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantityRequired, setQuantityRequired] = useState("");
  const [unitId, setUnitId] = useState("");
  const [creating, setCreating] = useState(false);
  const [menus, setMenus] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [editingId, setEditingId] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listRecipes();
      setRecipes(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load recipes";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([
        (async () => {
          await loadData();
        })(),
        (async () => {
          try {
            const res = await listMenus();
            setMenus(res.data || []);
          } catch (err) {
            console.error("Failed to load menus for recipes", err);
          }
        })(),
        (async () => {
          try {
            const res = await fetchProducts({ page: 1, limit: 1000 });
            setProducts(res.data || []);
          } catch (err) {
            console.error("Failed to load products for recipes", err);
          }
        })(),
        (async () => {
          try {
            const res = await fetchUnits();
            setUnits(res.data || []);
          } catch (err) {
            console.error("Failed to load units for recipes", err);
          }
        })(),
      ]);
    };
    run();
  }, []);

  useEffect(() => {
    const state = location.state;
    if (state?.menuId) {
      setMenuId(state.menuId);
    }
  }, [location.state]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!menuId || !productId || !quantityRequired || !unitId) {
      setError("Menu, product, quantity and unit are required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const payload = {
        menu_id: menuId,
        product_id: productId,
        quantity_required: quantityRequired,
        unit_id: unitId,
      };

      if (editingId) {
        await updateRecipe(editingId, payload);
      } else {
        await createRecipe(payload);
      }
      setMenuId("");
      setProductId("");
      setQuantityRequired("");
      setUnitId("");
      setEditingId("");
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || (editingId ? "Failed to update recipe" : "Failed to create recipe");
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (recipe) => {
    setEditingId(recipe.id);
    setMenuId(recipe.menu_id || recipe.Menu?.id || "");
    setProductId(recipe.product_id || recipe.Product?.id || "");
    setQuantityRequired(String(recipe.quantity_required ?? ""));
    setUnitId(recipe.unit_id || recipe.Unit?.id || "");
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    setError("");
    try {
      await deleteRecipe(id);
      if (editingId === id) {
        setEditingId("");
        setMenuId("");
        setProductId("");
        setQuantityRequired("");
        setUnitId("");
      }
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete recipe";
      setError(msg);
    }
  };

  return (
    <PageShell
      title="Recipes"
      subtitle="Recipes linking menus to products and required quantities."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <form
            onSubmit={handleCreate}
            className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs grid md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Menu
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
              >
                <option value="">Select menu</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Product
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Quantity required"
              type="number"
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(e.target.value)}
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Unit
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              >
                <option value="">Select unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button
                type="submit"
                className="px-3 py-1 text-[11px]"
                disabled={creating}
              >
                {creating
                  ? editingId
                    ? "Saving..."
                    : "Creating..."
                  : editingId
                  ? "Save changes"
                  : "Create recipe"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px] ml-2"
                  onClick={() => {
                    setEditingId("");
                    setMenuId("");
                    setProductId("");
                    setQuantityRequired("");
                    setUnitId("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {recipes.length === 0 ? (
            <p className="text-sm text-slate-400">No recipes found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Menu</th>
                    <th className="px-2 py-2 text-left">Product</th>
                    <th className="px-2 py-2 text-right">Quantity required</th>
                    <th className="px-2 py-2 text-left">Unit</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">{r.Menu?.name || "-"}</td>
                      <td className="px-2 py-2">{r.Product?.name || "-"}</td>
                      <td className="px-2 py-2 text-right">
                        {r.quantity_required ?? 0}
                      </td>
                      <td className="px-2 py-2">{r.Unit?.name || "-"}</td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] mr-2"
                          onClick={() => handleEditClick(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px]"
                          onClick={() => handleDeleteClick(r.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default AdminRecipesPage;
