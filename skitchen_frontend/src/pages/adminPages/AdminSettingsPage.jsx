import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PageShell, Card, Input, Button, Alert } from "../../components";
import { fetchSettings, updateSettings, resetSettings } from "../../services/settingsService";

const AdminSettingsPage = () => {
  const user = useSelector((state) => state.user.user);

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [invoiceFooterText, setInvoiceFooterText] = useState("");
  const [currency, setCurrency] = useState("RWF");
  const [allowedPaymentMethods, setAllowedPaymentMethods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const data = await fetchSettings();
        if (data) {
          setCompanyName(data.companyName || "");
          setCompanyEmail(data.companyEmail || "");
          setCompanyPhone(data.companyPhone || "");
          setCompanyAddress(data.companyAddress || "");
          setCompanyLogoUrl(data.companyLogoUrl || "");
          setTaxRate(
            typeof data.taxRate === "number" && !Number.isNaN(data.taxRate)
              ? String(data.taxRate)
              : ""
          );
          setServiceCharge(
            typeof data.serviceCharge === "number" &&
              !Number.isNaN(data.serviceCharge)
              ? String(data.serviceCharge)
              : ""
          );
          setInvoiceFooterText(data.invoiceFooterText || "");
          setCurrency(data.currency || "RWF");
          setAllowedPaymentMethods(
            Array.isArray(data.allowedPaymentMethods)
              ? data.allowedPaymentMethods
              : []
          );
        }
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const togglePaymentMethod = (method) => {
    setAllowedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // basic validation
      if (companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
        setError("Please enter a valid email address.");
        setSaving(false);
        return;
      }

      const tax = taxRate === "" ? null : Number(taxRate);
      const svc = serviceCharge === "" ? null : Number(serviceCharge);

      if (tax != null && tax < 0) {
        setError("Tax rate cannot be negative.");
        setSaving(false);
        return;
      }
      if (svc != null && svc < 0) {
        setError("Service charge cannot be negative.");
        setSaving(false);
        return;
      }

      const payload = {
        companyName: companyName || null,
        companyEmail: companyEmail || null,
        companyPhone: companyPhone || null,
        companyAddress: companyAddress || null,
        companyLogoUrl: companyLogoUrl || null,
        taxRate: tax,
        serviceCharge: svc,
        invoiceFooterText: invoiceFooterText || null,
        currency: currency || "RWF",
        allowedPaymentMethods,
      };
      await updateSettings(payload);
      setSuccess("Settings updated successfully.");
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = (user?.role || "-").toString();

  return (
    <PageShell
      title="System Settings"
      subtitle="Configure company information, finance, and payment options."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <p className="text-xs text-slate-400 uppercase mb-1">Current Admin</p>
          <p className="text-lg font-semibold text-slate-100">
            {user?.username || user?.email || user?.name || "Unknown"}
          </p>
          <p className="text-xs text-slate-400 mt-1">Role: {roleLabel}</p>
        </Card>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-300">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <Card title="Company Information">
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <Input
                label="Company Email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
              <Input
                label="Company Phone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
              <Input
                label="Company Address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
              <Input
                label="Company Logo URL"
                value={companyLogoUrl}
                onChange={(e) => setCompanyLogoUrl(e.target.value)}
              />
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Finance">
              <div className="space-y-4">
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
                <Input
                  label="Service Charge (%)"
                  type="number"
                  step="0.01"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                />
                <Input
                  label="Currency (e.g. RWF)"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                />
              </div>
            </Card>

            <Card title="Allowed Payment Methods">
              <div className="space-y-3 text-sm text-slate-200">
                {[
                  { key: "cash", label: "Cash" },
                  { key: "card", label: "Card" },
                  { key: "mobile", label: "Mobile" },
                ].map((m) => (
                  <label
                    key={m.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-slate-900"
                      checked={allowedPaymentMethods.includes(m.key)}
                      onChange={() => togglePaymentMethod(m.key)}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Invoice / Receipt Footer">
            <textarea
              className="w-full min-h-[80px] bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={invoiceFooterText}
              onChange={(e) => setInvoiceFooterText(e.target.value)}
              placeholder="Thank you for dining with us!"
            />
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError("");
                setSuccess("");
                try {
                  const data = await resetSettings();
                  setCompanyName(data.companyName || "");
                  setCompanyEmail(data.companyEmail || "");
                  setCompanyPhone(data.companyPhone || "");
                  setCompanyAddress(data.companyAddress || "");
                  setCompanyLogoUrl(data.companyLogoUrl || "");
                  setTaxRate(
                    typeof data.taxRate === "number" && !Number.isNaN(data.taxRate)
                      ? String(data.taxRate)
                      : ""
                  );
                  setServiceCharge(
                    typeof data.serviceCharge === "number" &&
                      !Number.isNaN(data.serviceCharge)
                      ? String(data.serviceCharge)
                      : ""
                  );
                  setInvoiceFooterText(data.invoiceFooterText || "");
                  setCurrency(data.currency || "RWF");
                  setAllowedPaymentMethods(
                    Array.isArray(data.allowedPaymentMethods)
                      ? data.allowedPaymentMethods
                      : []
                  );
                  setSuccess("Settings reset to defaults.");
                } catch (e) {
                  setError(e?.response?.data?.error || "Failed to reset settings");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Reset to Defaults
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      )}
    </PageShell>
  );
};

export default AdminSettingsPage;