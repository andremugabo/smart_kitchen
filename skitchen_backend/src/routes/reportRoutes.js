import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getSalesSummaryController,
  getMenuPerformanceController,
  getPurchaseSummaryController,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/sales-summary", authenticate("admin", "manager"), getSalesSummaryController);
router.get("/menu-performance", authenticate("admin", "manager"), getMenuPerformanceController);
router.get("/purchase-summary", authenticate("admin", "manager"), getPurchaseSummaryController);

export default router;
