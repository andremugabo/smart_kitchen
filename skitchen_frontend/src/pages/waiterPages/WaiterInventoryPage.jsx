import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert } from "../../components";
import { listInventory } from "../../services/inventoryService";
import { fetchProducts } from "../../services/productService";

const WaiterInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);

  const findProduct = (id) =>
    products.find((p) => String(p.id) === String(id));

  const productName = (id) => findProduct(id)?.name || id || "-";

  const isLowStock = (inv) => {
    const prod = findProduct(inv.product_id);
    if (!prod) return false;
    const threshold = parseFloat(prod.min_stock_threshold ?? 0);
    const qty = parseFloat(inv.quantity_available ?? 0);
    if (Number.isNaN(threshold)) return false;
    return qty < threshold;
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [invRes, prodRes] = await Promise.all([
          listInventory(),
          fetchProducts({ page: 1, limit: 1000 }),
        ]);
        setItems(invRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to load inventory";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <PageShell
      title="Inventory overview"
      subtitle="Read-only view of current inventory levels."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No inventory records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Product</th>
                    <th className="px-2 py-2 text-right">Quantity available</th>
                    <th className="px-2 py-2 text-left">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => {
                    const low = isLowStock(inv);
                    return (
                      <tr
                        key={inv.id}
                        className={
                          "border-b border-slate-900 hover:bg-slate-900/40" +
                          (low ? " bg-red-950/30" : "")
                        }
                      >
                        <td className="px-2 py-2">
                          <span className={low ? "text-red-300" : ""}>
                            {productName(inv.product_id)}
                          </span>
                          {low && (
                            <span className="ml-2 text-[10px] text-red-400 uppercase tracking-wide">
                              Low stock
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className={low ? "text-red-300 font-semibold" : ""}>
                            {inv.quantity_available ?? 0}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          {inv.last_updated
                            ? new Date(inv.last_updated).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default WaiterInventoryPage;
