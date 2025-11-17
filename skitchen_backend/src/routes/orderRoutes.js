import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listOrdersController,
  getOrderController,
  createOrderController,
  updateOrderStatusController,
  deleteOrderController,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", listOrdersController);
router.get("/:id", getOrderController);

router.post("/", authenticate("admin", "manager", "waiter"), createOrderController);
router.put("/:id/status", authenticate("admin", "manager", "waiter"), updateOrderStatusController);
router.delete("/:id", authenticate("admin", "manager"), deleteOrderController);

export default router;
