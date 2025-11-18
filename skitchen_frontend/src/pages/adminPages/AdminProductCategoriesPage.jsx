import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import {
  listProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "../../services/productCategoryService";
import { listProductTypes } from "../../services/productTypeService";

const AdminProductCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [catRes, typeRes] = await Promise.all([
        listProductCategories(),
        listProductTypes(),
      ]);
      setCategories(catRes.data || []);
      setTypes(typeRes.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load categories";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const typeName = (id) => types.find((t) => t.id === id)?.name || "-";

  const openCreate = () => {
    setEditing(null);
    setName("");
    setTypeId("");
    setFormOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name || "");
    setTypeId(cat.type_id || "");
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !typeId) {
      setError("Name and type are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { name: name.trim(), type_id: typeId };
      if (editing) {
        await updateProductCategory(editing.id, payload);
      } else {
        await createProductCategory(payload);
      }
      setFormOpen(false);
      setEditing(null);
      setName("");
      setTypeId("");
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save category";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    setError("");
    try {
      await deleteProductCategory(cat.id);
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete category";
      setError(msg);
    }
  };

  return (
    <PageShell
      title="Product categories"
      subtitle="Manage product categories and their associated types."
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
              New category
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
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Type
                </label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
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
                    ? "Update category"
                    : "Create category"}
                </Button>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            <p className="text-sm text-slate-400">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-left">Type</th>
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
                      <td className="px-2 py-2">{typeName(c.type_id)}</td>
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

export default AdminProductCategoriesPage;
