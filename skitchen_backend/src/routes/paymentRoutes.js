import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listPaymentsController,
  getPaymentController,
  createPaymentController,
  updatePaymentStatusController,
  generateReceiptPdfController,
  generatePaymentsReportPdfController,
  paymentsSummaryController,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/", authenticate("admin", "manager"), listPaymentsController);
// Define static and more specific routes before parameterized ones to avoid conflicts
router.get("/summary", authenticate("admin", "manager"), paymentsSummaryController);
router.get("/report/pdf", authenticate("admin", "manager"), generatePaymentsReportPdfController);
router.post("/", authenticate("admin", "manager"), createPaymentController);
router.put("/:id/status", authenticate("admin", "manager"), updatePaymentStatusController);
router.get("/:id/receipt", authenticate("admin", "manager"), generateReceiptPdfController);
router.get("/:id", authenticate("admin", "manager"), getPaymentController);

export default router;
