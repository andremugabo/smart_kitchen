import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listPaymentsController,
  getPaymentController,
  createPaymentController,
  updatePaymentStatusController,
  generateReceiptPdfController,
  generatePaymentsReportPdfController,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/", authenticate("admin", "manager"), listPaymentsController);
router.get("/:id", authenticate("admin", "manager"), getPaymentController);
router.post("/", authenticate("admin", "manager"), createPaymentController);
router.put("/:id/status", authenticate("admin", "manager"), updatePaymentStatusController);
router.get("/:id/receipt", authenticate("admin", "manager"), generateReceiptPdfController);
router.get("/report/pdf", authenticate("admin", "manager"), generatePaymentsReportPdfController);

export default router;
