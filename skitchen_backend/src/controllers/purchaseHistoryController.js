import multer from "multer";
import path from "path";
import fs from "fs";
import { listPurchases, getPurchase, createPurchase } from "../services/purchaseHistoryService.js";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads", "purchases");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const uploadPurchaseProof = multer({ storage });

export const listPurchasesController = async (_req, res) => {
  try {
    const items = await listPurchases();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getPurchaseController = async (req, res) => {
  try {
    const ph = await getPurchase(req.params.id);
    res.json({ success: true, data: ph });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createPurchaseController = async (req, res) => {
  try {
    const { product_id, quantity, price_per_unit, supplier_name, purchase_date, invoice_no, notes } = req.body;

    if (!product_id || !quantity || !price_per_unit) {
      return res.status(400).json({ success: false, error: "product_id, quantity and price_per_unit are required" });
    }

    const proof_image = req.file?.path;

    const ph = await createPurchase({
      product_id, // UUID
      user_id: req.user?.id, // UUID of authenticated user
      quantity,
      price_per_unit,
      supplier_name,
      purchase_date,
      invoice_no,
      notes,
      proof_image,
    });

    res.status(201).json({ success: true, data: ph });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
