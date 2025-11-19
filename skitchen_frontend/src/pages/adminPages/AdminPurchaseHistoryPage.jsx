import React, { useEffect, useState } from "react";
import { PageShell, Card, Spinner, Alert, Input, Button } from "../../components";
import { listPurchases, createPurchase } from "../../services/purchaseHistoryService";
import { fetchProducts } from "../../services/productService";

const AdminPurchaseHistoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formInvoice, setFormInvoice] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const productName = (id) =>
    products.find((p) => String(p.id) === String(id))?.name || id || "-";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listPurchases();
      setItems(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load purchases";
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
            console.error("Failed to load products for purchase history", err);
          }
        })(),
      ]);
    };
    run();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formProductId || !formQuantity || !formPrice) {
      setError("Product, quantity and price per unit are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createPurchase({
        product_id: formProductId,
        quantity: formQuantity,
        price_per_unit: formPrice,
        supplier_name: formSupplier || undefined,
        purchase_date: formDate || undefined,
        invoice_no: formInvoice || undefined,
        notes: formNotes || undefined,
      });

      setFormProductId("");
      setFormQuantity("");
      setFormPrice("");
      setFormSupplier("");
      setFormDate("");
      setFormInvoice("");
      setFormNotes("");

      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to create purchase";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((ph) => {
    const matchesProduct = productFilter
      ? String(ph.product_id || "") === String(productFilter)
      : true;

    const matchesSupplier = supplierFilter
      ? String(ph.supplier_name || "")
          .toLowerCase()
          .includes(supplierFilter.toLowerCase())
      : true;

    let matchesFrom = true;
    let matchesTo = true;
    if (fromDate || toDate) {
      const ts = ph.purchase_date ? new Date(ph.purchase_date).getTime() : null;
      if (!ts) {
        // if we are filtering by date and this record has no date, hide it
        return false;
      }
      if (fromDate) {
        const fromTs = new Date(fromDate).getTime();
        matchesFrom = ts >= fromTs;
      }
      if (toDate) {
        const toTs = new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1;
        matchesTo = ts <= toTs;
      }
    }

    return matchesProduct && matchesSupplier && matchesFrom && matchesTo;
  });

  const totals = filteredItems.reduce(
    (acc, ph) => {
      const qty = parseFloat(ph.quantity);
      const price = parseFloat(ph.price_per_unit);
      const safeQty = Number.isNaN(qty) ? 0 : qty;
      const safePrice = Number.isNaN(price) ? 0 : price;
      acc.quantity += safeQty;
      acc.amount += safeQty * safePrice;
      return acc;
    },
    { quantity: 0, amount: 0 }
  );

  return (
    <PageShell
      title="Purchase history"
      subtitle="Historical purchases of products."
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
            className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs grid md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Product
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
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
              label="Quantity"
              type="number"
              value={formQuantity}
              onChange={(e) => setFormQuantity(e.target.value)}
            />
            <Input
              label="Price per unit"
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
            <Input
              label="Supplier"
              value={formSupplier}
              onChange={(e) => setFormSupplier(e.target.value)}
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Purchase date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs w-full"
              />
            </div>
            <Input
              label="Invoice no."
              value={formInvoice}
              onChange={(e) => setFormInvoice(e.target.value)}
            />
            <Input
              label="Notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="md:col-span-2 lg:col-span-3"
            />
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2">
              <Button
                type="submit"
                className="px-3 py-1 text-[11px]"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create purchase"}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <div className="min-w-[220px]">
              <label className="block text-[11px] text-slate-400 mb-1">
                Product
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              >
                <option value="">All products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Supplier contains"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="max-w-[200px]"
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                From date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                To date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <p className="text-sm text-slate-400">No purchases found.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-end text-[11px] text-slate-400 mb-1">
                <span>
                  Total qty: <span className="font-semibold">{totals.quantity}</span>
                </span>
                <span className="ml-4">
                  Total spent: <span className="font-semibold">{totals.amount.toFixed(2)}</span>
                </span>
              </div>
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Product</th>
                    <th className="px-2 py-2 text-right">Quantity</th>
                    <th className="px-2 py-2 text-right">Price / unit</th>
                    <th className="px-2 py-2 text-left">Supplier</th>
                    <th className="px-2 py-2 text-left">Purchase date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((ph) => (
                    <tr
                      key={ph.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">{productName(ph.product_id)}</td>
                      <td className="px-2 py-2 text-right">{ph.quantity ?? 0}</td>
                      <td className="px-2 py-2 text-right">
                        {ph.price_per_unit ?? 0}
                      </td>
                      <td className="px-2 py-2">{ph.supplier_name || "-"}</td>
                      <td className="px-2 py-2">
                        {ph.purchase_date
                          ? new Date(ph.purchase_date).toLocaleString()
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

export default AdminPurchaseHistoryPage;
