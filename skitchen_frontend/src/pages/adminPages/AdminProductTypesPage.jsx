import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import {
  listProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} from "../../services/productTypeService";

const AdminProductTypesPage = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const loadTypes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listProductTypes();
      setTypes(data.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load product types";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setFormOpen(true);
  };

  const openEdit = (type) => {
    setEditing(type);
    setName(type.name || "");
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
      if (editing) {
        await updateProductType(editing.id, { name: name.trim() });
      } else {
        await createProductType({ name: name.trim() });
      }
      setFormOpen(false);
      setEditing(null);
      setName("");
      await loadTypes();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save product type";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type) => {
    if (!window.confirm(`Delete type "${type.name}"?`)) return;
    setError("");
    try {
      await deleteProductType(type.id);
      await loadTypes();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete product type";
      setError(msg);
    }
  };

  return (
    <PageShell
      title="Product types"
      subtitle="Manage product types used to group product categories."
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
              Total types: <span className="font-semibold">{types.length}</span>
            </div>
            <Button
              type="button"
              className="px-3 py-1 text-[11px]"
              onClick={openCreate}
            >
              New type
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
                    ? "Update type"
                    : "Create type"}
                </Button>
              </div>
            </form>
          )}

          {types.length === 0 ? (
            <p className="text-sm text-slate-400">No product types found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">{t.name}</td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] mr-2"
                          onClick={() => openEdit(t)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] text-red-400"
                          onClick={() => handleDelete(t)}
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

export default AdminProductTypesPage;
