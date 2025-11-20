import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getSalesSummaryController,
  getMenuPerformanceController,
  getPurchaseSummaryController,
  getSalesOverTimeController,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/sales-summary", authenticate("admin", "manager", "chef", "waiter"), getSalesSummaryController);
router.get("/menu-performance", authenticate("admin", "manager", "chef"), getMenuPerformanceController);
router.get("/purchase-summary", authenticate("admin", "manager"), getPurchaseSummaryController);
router.get("/sales-over-time", authenticate("admin", "manager", "chef", "waiter"), getSalesOverTimeController);

export default router;
