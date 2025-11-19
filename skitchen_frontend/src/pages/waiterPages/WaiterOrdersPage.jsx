import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../services/api";
import { PageShell, Card, Spinner, Alert, Input, Button } from "../../components";
import { listMenus } from "../../services/menuService";

const WaiterOrdersPage = () => {
  const user = useSelector((state) => state.user.user);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [items, setItems] = useState([{ menu_id: "", quantity: "1", kitchen_note: "" }]);
  const [saving, setSaving] = useState(false);

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

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { menu_id: "", quantity: "1", kitchen_note: "" }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const summary = items.reduce(
    (acc, it) => {
      const menu = menus.find((m) => String(m.id) === String(it.menu_id));
      if (!menu) return acc;
      const qty = Number(it.quantity || 0);
      if (!qty || Number.isNaN(qty)) return acc;
      const price = Number(menu.price || 0);
      const estimatedCost = Number(menu.estimated_cost || 0);
      acc.totalPrice += price * qty;
      acc.totalCost += estimatedCost * qty;
      return acc;
    },
    { totalPrice: 0, totalCost: 0 }
  );
  const totalProfit = summary.totalPrice - summary.totalCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError("Missing user context; please re-login.");
      return;
    }
    const validItems = items
      .map((it) => ({
        menu_id: it.menu_id,
        quantity: Number(it.quantity || 0),
        kitchen_note: it.kitchen_note || undefined,
      }))
      .filter((it) => it.menu_id && it.quantity > 0);

    if (!validItems.length) {
      setError("Add at least one menu item with quantity > 0.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/orders", {
        user_id: user.id,
        table_number: tableNumber || undefined,
        items: validItems,
      });
      setTableNumber("");
      setItems([{ menu_id: "", quantity: "1", kitchen_note: "" }]);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to create order";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Create order"
      subtitle="Create a new order for a table."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <form
            onSubmit={handleSubmit}
            className="p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs space-y-3"
          >
            <div className="grid md:grid-cols-3 gap-3">
              <Input
                label="Table number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. T1"
              />
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Items</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 py-1 text-[11px]"
                  onClick={addItemRow}
                >
                  Add item
                </Button>
              </div>

              {items.map((it, idx) => {
                const menu = menus.find((m) => String(m.id) === String(it.menu_id));
                let price = 0;
                let estimatedCost = 0;
                let profit = 0;
                let margin = 0;
                if (menu) {
                  price = Number(menu.price || 0);
                  estimatedCost = Number(menu.estimated_cost || 0);
                  profit = price - estimatedCost;
                  margin = price > 0 ? (profit / price) * 100 : 0;
                }

                return (
                  <div
                    key={idx}
                    className="grid md:grid-cols-3 gap-2 items-end border border-slate-800 rounded-md p-2 bg-slate-950/40"
                  >
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Menu
                      </label>
                      <select
                        className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                        value={it.menu_id}
                        onChange={(e) => updateItem(idx, "menu_id", e.target.value)}
                      >
                        <option value="">Select menu</option>
                        {menus.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      {menu && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          Price: <span className="font-semibold">{price}</span>{" "}
                          | Cost: <span>{estimatedCost}</span>{" "}
                          | Margin: <span>{margin.toFixed(1)}%</span>
                        </p>
                      )}
                    </div>
                    <Input
                      label="Quantity"
                      type="number"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    />
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Kitchen note (optional)
                      </label>
                      <input
                        type="text"
                        className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full text-xs"
                        value={it.kitchen_note}
                        onChange={(e) => updateItem(idx, "kitchen_note", e.target.value)}
                      />
                    </div>
                    {items.length > 1 && (
                      <div className="md:col-span-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px]"
                          onClick={() => removeItemRow(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {summary.totalPrice > 0 && (
              <div className="mt-3 p-2 rounded-md bg-slate-950/60 border border-slate-800 text-[11px] flex flex-wrap gap-4 justify-end">
                <span>
                  Order total: <span className="font-semibold">{summary.totalPrice.toFixed(2)}</span>
                </span>
                <span>
                  Est. cost: <span>{summary.totalCost.toFixed(2)}</span>
                </span>
                <span>
                  Profit: <span className={totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}>{totalProfit.toFixed(2)}</span>
                </span>
              </div>
            )}

            <div className="flex justify-end mt-3">
              <Button
                type="submit"
                className="px-3 py-1 text-[11px]"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create order"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </PageShell>
  );
};

export default WaiterOrdersPage;
