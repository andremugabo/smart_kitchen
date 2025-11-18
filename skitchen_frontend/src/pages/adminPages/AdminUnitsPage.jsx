import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import {
  listUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../../services/unitService";

const AdminUnitsPage = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadUnits = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listUnits();
      setUnits(data.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load units";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setFormOpen(true);
  };

  const openEdit = (unit) => {
    setEditing(unit);
    setName(unit.name || "");
    setDescription(unit.description || "");
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
      const payload = { name: name.trim(), description: description.trim() };
      if (editing) {
        await updateUnit(editing.id, payload);
      } else {
        await createUnit(payload);
      }
      setFormOpen(false);
      setEditing(null);
      setName("");
      setDescription("");
      await loadUnits();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save unit";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit) => {
    if (!window.confirm(`Delete unit "${unit.name}"?`)) return;
    setError("");
    try {
      await deleteUnit(unit.id);
      await loadUnits();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete unit";
      setError(msg);
    }
  };

  return (
    <PageShell
      title="Units"
      subtitle="Manage measurement units used for purchasing and selling products."
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
              Total units: <span className="font-semibold">{units.length}</span>
            </div>
            <Button
              type="button"
              className="px-3 py-1 text-[11px]"
              onClick={openCreate}
            >
              New unit
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
                  Description
                </label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
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
                    ? "Update unit"
                    : "Create unit"}
                </Button>
              </div>
            </form>
          )}

          {units.length === 0 ? (
            <p className="text-sm text-slate-400">No units found.</p>
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
                  {units.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">{u.name}</td>
                      <td className="px-2 py-2">{u.description || "-"}</td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] mr-2"
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] text-red-400"
                          onClick={() => handleDelete(u)}
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

export default AdminUnitsPage;
