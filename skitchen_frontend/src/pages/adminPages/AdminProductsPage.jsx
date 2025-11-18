import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell, Card, Spinner, Alert, Button, Input } from "../../components";
import {
  fetchProducts,
  fetchProductCategories,
  fetchUnits,
  fetchProductTypes,
  createProduct,
  updateProduct,
} from "../../services/productService";

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [types, setTypes] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    type_id: "",
    category_id: "",
    purchasing_unit_id: "",
    selling_unit_id: "",
    min_stock_threshold: "0",
    isActive: true,
    picture: null,
  });

  const loadLookups = async () => {
    try {
      const [catRes, unitRes, typeRes] = await Promise.all([
        fetchProductCategories(),
        fetchUnits(),
        fetchProductTypes(),
      ]);
      setCategories(catRes.data || []);
      setUnits(unitRes.data || []);
      setTypes(typeRes.data || []);
    } catch (err) {
      // lookups failing shouldn't block page entirely
      console.error("Failed to load product lookups", err);
    }
  };

  const loadProducts = async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts({ page: targetPage, limit: 20 });
      setProducts(data.data || []);
      setMeta(data.meta || { page: targetPage, totalPages: 1, total: 0, limit: 20 });
      setPage(data.meta?.page || targetPage);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
    loadProducts(1);
  }, []);

  const categoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "-";

  const unitName = (id) => units.find((u) => u.id === id)?.name || "-";

  const categoryById = (id) => categories.find((c) => c.id === id) || null;

  const typeName = (id) => types.find((t) => t.id === id)?.name || "-";

  const filteredProducts = products.filter((p) => {
    const matchesName = nameFilter
      ? p.name.toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    const matchesCategory =
      categoryFilter === "all" || p.category_id === categoryFilter;
    const cat = categoryById(p.category_id);
    const matchesType =
      typeFilter === "all" || (cat && cat.type_id === typeFilter);
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && p.isActive) ||
      (activeFilter === "inactive" && !p.isActive);
    return matchesName && matchesCategory && matchesType && matchesActive;
  });

  const handlePrev = () => {
    if (page > 1) loadProducts(page - 1);
  };

  const handleNext = () => {
    if (page < (meta.totalPages || 1)) loadProducts(page + 1);
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormValues({
      name: "",
      type_id: "",
      category_id: "",
      purchasing_unit_id: "",
      selling_unit_id: "",
      min_stock_threshold: "0",
      isActive: true,
      picture: null,
    });
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    const cat = categoryById(product.category_id);
    setFormValues({
      name: product.name || "",
      type_id: cat?.type_id || "",
      category_id: product.category_id || "",
      purchasing_unit_id: product.purchasing_unit_id || "",
      selling_unit_id: product.selling_unit_id || "",
      min_stock_threshold: String(product.min_stock_threshold ?? "0"),
      isActive: !!product.isActive,
      picture: null,
    });
    setFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormValues((prev) => ({ ...prev, picture: file }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formValues.name || !formValues.category_id) {
      setError("Name and category are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("category_id", formValues.category_id);
      if (formValues.purchasing_unit_id) {
        formData.append("purchasing_unit_id", formValues.purchasing_unit_id);
      }
      if (formValues.selling_unit_id) {
        formData.append("selling_unit_id", formValues.selling_unit_id);
      }
      formData.append(
        "min_stock_threshold",
        formValues.min_stock_threshold || "0"
      );
      formData.append("isActive", formValues.isActive ? "true" : "false");
      if (formValues.picture) {
        formData.append("picture", formValues.picture);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }

      setFormOpen(false);
      setEditingProduct(null);
      setFormValues({
        name: "",
        category_id: "",
        purchasing_unit_id: "",
        selling_unit_id: "",
        min_stock_threshold: "0",
        isActive: true,
        picture: null,
      });
      await loadProducts(page);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save product";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Products"
      subtitle="Browse all products and their stock configuration."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <div className="text-slate-400 mr-4">
              Total products: <span className="font-semibold">{meta.total}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                label="Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="max-w-[180px]"
              />
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Type
                </label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Category
                </label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {categories
                    .filter((c) =>
                      typeFilter === "all" ? true : c.type_id === typeFilter
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Status
                </label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                onClick={() => navigate("/app/admin/product-types")}
              >
                Manage types
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                onClick={() => navigate("/app/admin/product-categories")}
              >
                Manage categories
              </Button>
              <Button
                type="button"
                className="px-3 py-1 text-[11px] mr-2"
                onClick={openCreateForm}
              >
                New product
              </Button>
              <span className="text-slate-400">
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                disabled={meta.page <= 1}
                onClick={handlePrev}
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                disabled={meta.page >= (meta.totalPages || 1)}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>

          {formOpen && (
            <form
              onSubmit={handleSave}
              className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs space-y-3"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input
                  label="Name"
                  value={formValues.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                    value={formValues.type_id}
                    onChange={(e) => {
                      const newTypeId = e.target.value;
                      handleFormChange("type_id", newTypeId);
                      // reset category if it no longer matches
                      const currentCat = categoryById(formValues.category_id);
                      if (!currentCat || String(currentCat.type_id) !== String(newTypeId)) {
                        handleFormChange("category_id", "");
                      }
                    }}
                  >
                    <option value="">Select type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                    value={formValues.category_id}
                    onChange={(e) => handleFormChange("category_id", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((c) =>
                        formValues.type_id ? String(c.type_id) === String(formValues.type_id) : true
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="min-w-[140px]">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Purchasing unit
                  </label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                    value={formValues.purchasing_unit_id}
                    onChange={(e) =>
                      handleFormChange("purchasing_unit_id", e.target.value)
                    }
                  >
                    <option value="">None</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[140px]">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Selling unit
                  </label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                    value={formValues.selling_unit_id}
                    onChange={(e) =>
                      handleFormChange("selling_unit_id", e.target.value)
                    }
                  >
                    <option value="">None</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1 text-[11px] mt-5"
                    onClick={() => navigate("/app/admin/units")}
                  >
                    Manage units
                  </Button>
                </div>
                <Input
                  label="Min stock threshold"
                  type="number"
                  value={formValues.min_stock_threshold}
                  onChange={(e) => handleFormChange("min_stock_threshold", e.target.value)}
                />
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                    value={formValues.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      handleFormChange("isActive", e.target.value === "active")
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-[11px] text-slate-300 file:text-[11px] file:px-2 file:py-1 file:bg-slate-800 file:border-0 file:rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-[11px]"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingProduct(null);
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
                    : editingProduct
                    ? "Update product"
                    : "Create product"}
                </Button>
              </div>
            </form>
          )}

          {filteredProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Image</th>
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-left">Type</th>
                    <th className="px-2 py-2 text-left">Category</th>
                    <th className="px-2 py-2 text-left">Purchasing unit</th>
                    <th className="px-2 py-2 text-left">Selling unit</th>
                    <th className="px-2 py-2 text-right">Min stock</th>
                    <th className="px-2 py-2 text-left">Active</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">
                        {p.picture ? (
                          <img
                            src={
                              p.picture.startsWith("http")
                                ? p.picture
                                : (() => {
                                    const rawBase = import.meta.env.VITE_API_BASE_URL || "";
                                    const base = rawBase.endsWith("/api")
                                      ? rawBase.slice(0, -4)
                                      : rawBase;
                                    const cleanedPath = p.picture.replace(/^\//, "");
                                    return `${base}/${cleanedPath}`;
                                  })()
                            }
                            alt={p.name}
                            className="w-10 h-10 rounded object-cover border border-slate-800"
                          />
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2">{p.name}</td>
                      <td className="px-2 py-2">
                        {typeName(categoryById(p.category_id)?.type_id)}
                      </td>
                      <td className="px-2 py-2">{categoryName(p.category_id)}</td>
                      <td className="px-2 py-2">
                        {unitName(p.purchasing_unit_id)}
                      </td>
                      <td className="px-2 py-2">
                        {unitName(p.selling_unit_id)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {p.min_stock_threshold ?? 0}
                      </td>
                      <td className="px-2 py-2">
                        {p.isActive ? "Yes" : "No"}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px]"
                          onClick={() => openEditForm(p)}
                        >
                          Edit
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

export default AdminProductsPage;
