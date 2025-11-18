import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getSalesSummaryController,
  getMenuPerformanceController,
  getPurchaseSummaryController,
  getSalesOverTimeController,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/sales-summary", authenticate("admin", "manager"), getSalesSummaryController);
router.get("/menu-performance", authenticate("admin", "manager"), getMenuPerformanceController);
router.get("/purchase-summary", authenticate("admin", "manager"), getPurchaseSummaryController);
router.get("/sales-over-time", authenticate("admin", "manager"), getSalesOverTimeController);

export default router;
