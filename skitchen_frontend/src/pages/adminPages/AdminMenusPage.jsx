import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell, Card, Spinner, Alert, Input, Button } from "../../components";
import { listMenus, createMenu, updateMenu, deleteMenu } from "../../services/menuService";
import { listMenuCategories } from "../../services/menuCategoryService";

const AdminMenusPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [meta, setMeta] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isKitchenItem, setIsKitchenItem] = useState(false);
  const [pictureFile, setPictureFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [categories, setCategories] = useState([]);

  const menuCostInfo = (menu) => {
    const priceNum = Number(menu.price ?? 0);
    const costNum = Number(menu.estimated_cost ?? 0);
    const profit = priceNum - costNum;
    const margin = priceNum > 0 ? profit / priceNum : 0;
    return { priceNum, costNum, profit, margin };
  };

  const loadData = async (pageToLoad = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await listMenus({ page: pageToLoad, limit });
      setItems(res.data || []);
      setMeta(res.meta || null);
      setPage(res.meta?.page || pageToLoad);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load menus";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([
        (async () => {
          await loadData(1);
        })(),
        (async () => {
          try {
            const res = await listMenuCategories();
            setCategories(res.data || []);
          } catch (err) {
            console.error("Failed to load menu categories", err);
          }
        })(),
      ]);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId("");
    setName("");
    setPrice("");
    setDescription("");
    setCategoryId("");
    setIsActive(true);
    setIsKitchenItem(false);
    setPictureFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      setError("Name, price and category are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      if (description) formData.append("description", description);
      formData.append("is_active", isActive);
      formData.append("is_kitchen_item", isKitchenItem);
      if (pictureFile) formData.append("picture", pictureFile);

      if (editingId) {
        await updateMenu(editingId, formData);
      } else {
        await createMenu(formData);
      }
      resetForm();
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || (editingId ? "Failed to update menu" : "Failed to create menu");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (menu) => {
    setEditingId(menu.id);
    setName(menu.name || "");
    setPrice(menu.price ?? "");
    setDescription(menu.description || "");
    setCategoryId(menu.category_id || "");
    setIsActive(Boolean(menu.is_active));
    setIsKitchenItem(Boolean(menu.is_kitchen_item));
    setPictureFile(null);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Delete this menu?")) return;
    setError("");
    try {
      await deleteMenu(id);
      if (editingId === id) {
        resetForm();
      }
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete menu";
      setError(msg);
    }
  };

  const handlePageChange = async (nextPage) => {
    if (!meta) return;
    if (nextPage < 1 || nextPage > (meta.totalPages || 1)) return;
    await loadData(nextPage);
  };

  return (
    <PageShell
      title="Menus"
      subtitle="Manage menus (dishes) available in Smart Kitchen."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-4 text-xs">
            <div className="text-slate-400">
              Total menus: <span className="font-semibold">{items.length}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1 text-[11px]"
              onClick={() => navigate("/app/admin/menu-categories")}
            >
              Manage menu categories
            </Button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs grid md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Category
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Picture
              </label>
              <input
                type="file"
                accept="image/*"
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs w-full"
                onChange={(e) => setPictureFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <label className="text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <label className="text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={isKitchenItem}
                  onChange={(e) => setIsKitchenItem(e.target.checked)}
                />
                Kitchen item
              </label>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
              <Button
                type="submit"
                className="px-3 py-1 text-[11px]"
                disabled={saving}
              >
                {saving
                  ? editingId
                    ? "Saving..."
                    : "Creating..."
                  : editingId
                  ? "Save changes"
                  : "Create menu"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px]"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No menus found.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-end text-[11px] text-slate-400 mb-1">
                Page {meta?.page || 1} of {meta?.totalPages || 1}
              </div>
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-right">Price</th>
                    <th className="px-2 py-2 text-right">Estimated cost</th>
                    <th className="px-2 py-2 text-right">Profit / margin</th>
                    <th className="px-2 py-2 text-left">Category</th>
                    <th className="px-2 py-2 text-left">Active</th>
                    <th className="px-2 py-2 text-left">Kitchen</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => {
                    const { priceNum, costNum, profit, margin } = menuCostInfo(m);
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-slate-900 hover:bg-slate-900/40"
                      >
                        <td className="px-2 py-2">{m.name}</td>
                        <td className="px-2 py-2 text-right">{priceNum || 0}</td>
                        <td className="px-2 py-2 text-right">
                          {m.estimated_cost != null ? costNum.toFixed(2) : "-"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {m.estimated_cost != null
                            ? `${profit.toFixed(2)} (${(margin * 100).toFixed(1)}%)`
                            : "-"}
                        </td>
                        <td className="px-2 py-2">
                          {categories.find((c) => c.id === m.category_id)?.name || "-"}
                        </td>
                        <td className="px-2 py-2">
                          {m.is_active ? (
                            <span className="text-emerald-400">Active</span>
                          ) : (
                            <span className="text-slate-500">Inactive</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {m.is_kitchen_item ? "Yes" : "No"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-2 py-1 text-[11px] mr-2"
                            onClick={() => navigate(`/app/admin/menus/${m.id}`)}
                          >
                            Details
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-2 py-1 text-[11px] mr-2"
                            onClick={() => handleEditClick(m)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-2 py-1 text-[11px]"
                            onClick={() => handleDeleteClick(m.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end gap-2 mt-3 text-[11px]">
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 py-1"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!meta || page <= 1}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 py-1"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!meta || page >= (meta.totalPages || 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default AdminMenusPage;
