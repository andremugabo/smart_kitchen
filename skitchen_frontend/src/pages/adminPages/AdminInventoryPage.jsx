import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import {
  listInventory,
  setInventoryQuantity,
  incrementInventory,
  decrementInventory,
} from "../../services/inventoryService";
import { fetchProducts } from "../../services/productService";

const AdminInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustMode, setAdjustMode] = useState("set");
  const [adjustValue, setAdjustValue] = useState("0");
  const [saving, setSaving] = useState(false);

  const productName = (id) =>
    products.find((p) => String(p.id) === String(id))?.name || id || "-";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listInventory();
      setItems(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load inventory";
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
            const res = await fetchProducts({ page: 1, limit: 1000 });
            setProducts(res.data || []);
          } catch (err) {
            console.error("Failed to load products for inventory", err);
          }
        })(),
      ]);
    };
    run();
  }, []);

  const totalQuantity = items.reduce((sum, inv) => {
    const q = parseFloat(inv.quantity_available);
    return sum + (Number.isNaN(q) ? 0 : q);
  }, 0);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjustProductId || !adjustValue) return;
    setSaving(true);
    setError("");
    try {
      const numeric = parseFloat(adjustValue);
      if (Number.isNaN(numeric)) {
        setError("Adjustment value must be a number");
        setSaving(false);
        return;
      }

      if (adjustMode === "set") {
        await setInventoryQuantity(adjustProductId, numeric);
      } else if (adjustMode === "increment") {
        await incrementInventory(adjustProductId, numeric);
      } else if (adjustMode === "decrement") {
        await decrementInventory(adjustProductId, numeric);
      }

      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to adjust inventory";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Inventory"
      subtitle="Current inventory levels per product."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <form
            onSubmit={handleAdjust}
            className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[220px]">
              <label className="block text-[11px] text-slate-400 mb-1">
                Product
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={adjustProductId}
                onChange={(e) => setAdjustProductId(e.target.value)}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Action
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={adjustMode}
                onChange={(e) => setAdjustMode(e.target.value)}
              >
                <option value="set">Set quantity</option>
                <option value="increment">Increase by</option>
                <option value="decrement">Decrease by</option>
              </select>
            </div>
            <div className="min-w-[140px]">
              <Input
                label="Amount"
                type="number"
                value={adjustValue}
                onChange={(e) => setAdjustValue(e.target.value)}
              />
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                type="submit"
                className="px-3 py-1 text-[11px]"
                disabled={saving}
              >
                {saving ? "Saving..." : "Apply"}
              </Button>
            </div>
          </form>

          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No inventory records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-end text-[11px] text-slate-400 mb-1">
                Total quantity: <span className="font-semibold ml-1">{totalQuantity}</span>
              </div>
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Product</th>
                    <th className="px-2 py-2 text-right">Quantity available</th>
                    <th className="px-2 py-2 text-left">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">{productName(inv.product_id)}</td>
                      <td className="px-2 py-2 text-right">
                        {inv.quantity_available ?? 0}
                      </td>
                      <td className="px-2 py-2">
                        {inv.last_updated
                          ? new Date(inv.last_updated).toLocaleString()
                          : "-"}
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

export default AdminInventoryPage;
