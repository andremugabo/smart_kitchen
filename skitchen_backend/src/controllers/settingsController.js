import { Settings } from "../models/index.js";

const SETTINGS_ID = 1;

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findByPk(SETTINGS_ID);
    if (!settings) {
      settings = await Settings.create({ id: SETTINGS_ID });
    }
    res.json({ success: true, data: settings });
  } catch (e) {
    next(e);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      companyLogoUrl,
      taxRate,
      serviceCharge,
      invoiceFooterText,
      currency,
      allowedPaymentMethods,
      reset,
    } = req.body;

    let settings = await Settings.findByPk(SETTINGS_ID);
    if (!settings) {
      settings = await Settings.create({ id: SETTINGS_ID });
    }

    if (reset === true) {
      settings.companyName = null;
      settings.companyEmail = null;
      settings.companyPhone = null;
      settings.companyAddress = null;
      settings.companyLogoUrl = null;
      settings.taxRate = null;
      settings.serviceCharge = null;
      settings.invoiceFooterText = null;
      settings.currency = "RWF";
      settings.allowedPaymentMethods = ["cash", "card", "mobile"];
    } else {
      settings.companyName = companyName ?? settings.companyName;
      settings.companyEmail = companyEmail ?? settings.companyEmail;
      settings.companyPhone = companyPhone ?? settings.companyPhone;
      settings.companyAddress = companyAddress ?? settings.companyAddress;
      settings.companyLogoUrl = companyLogoUrl ?? settings.companyLogoUrl;
      settings.taxRate = typeof taxRate === "number" ? taxRate : settings.taxRate;
      settings.serviceCharge =
        typeof serviceCharge === "number" ? serviceCharge : settings.serviceCharge;
      settings.invoiceFooterText =
        invoiceFooterText ?? settings.invoiceFooterText;
      if (typeof currency === "string" && currency.trim()) {
        settings.currency = currency.trim();
      }
      if (Array.isArray(allowedPaymentMethods)) {
        settings.allowedPaymentMethods = allowedPaymentMethods;
      }
    }

    await settings.save();

    res.json({ success: true, data: settings });
  } catch (e) {
    next(e);
  }
};
