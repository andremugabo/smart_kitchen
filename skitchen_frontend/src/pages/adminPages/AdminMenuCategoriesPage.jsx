import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import {
  listMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "../../services/menuCategoryService";

const AdminMenuCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listMenuCategories();
      setCategories(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load menu categories";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setFormOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name || "");
    setDescription(cat.description || "");
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { name: name.trim(), description: description || undefined };
      if (editing) {
        await updateMenuCategory(editing.id, payload);
      } else {
        await createMenuCategory(payload);
      }
      setFormOpen(false);
      setEditing(null);
      setName("");
      setDescription("");
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save menu category";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete menu category "${cat.name}"?`)) return;
    setError("");
    try {
      await deleteMenuCategory(cat.id);
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete menu category";
      setError(msg);
    }
  };

  return (
    <PageShell
      title="Menu categories"
      subtitle="Manage categories for menus (dishes)."
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
              Total categories: <span className="font-semibold">{categories.length}</span>
            </div>
            <Button
              type="button"
              className="px-3 py-1 text-[11px]"
              onClick={openCreate}
            >
              New menu category
            </Button>
          </div>

          {formOpen && (
            <form
              onSubmit={handleSave}
              className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs space-y-3"
            >
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px]"
                  onClick={() => {
                    setFormOpen(false);
                    setEditing(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-3 py-1 text-[11px]"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Update menu category"
                    : "Create menu category"}
                </Button>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            <p className="text-sm text-slate-400">No menu categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-left">Description</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">{c.name}</td>
                      <td className="px-2 py-2">{c.description || "-"}</td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] mr-2"
                          onClick={() => openEdit(c)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] text-red-400"
                          onClick={() => handleDelete(c)}
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

export default AdminMenuCategoriesPage;
