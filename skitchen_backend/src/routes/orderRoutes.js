import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listOrdersController,
  getOrderController,
  createOrderController,
  updateOrderStatusController,
  deleteOrderController,
  getKitchenOrdersController,
  getCurrentWaiterOrdersController,
  generateOrderReceiptPdfController,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", listOrdersController);
router.get("/kitchen", authenticate("admin", "manager", "chef"), getKitchenOrdersController);
router.get("/waiter/current", authenticate("waiter"), getCurrentWaiterOrdersController);
router.get("/:id/receipt", authenticate("admin", "manager"), generateOrderReceiptPdfController);
router.get("/:id", getOrderController);

router.post("/", authenticate("admin", "manager", "waiter"), createOrderController);
router.put("/:id/status", authenticate("admin", "manager", "waiter"), updateOrderStatusController);
router.delete("/:id", authenticate("admin", "manager"), deleteOrderController);

export default router;
