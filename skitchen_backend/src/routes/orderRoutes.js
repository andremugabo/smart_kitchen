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
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", listOrdersController);
router.get("/:id", getOrderController);

router.get("/kitchen", authenticate("admin", "manager", "chef"), getKitchenOrdersController);
router.get("/waiter/current", authenticate("waiter"), getCurrentWaiterOrdersController);

router.post("/", authenticate("admin", "manager", "waiter"), createOrderController);
router.put("/:id/status", authenticate("admin", "manager", "waiter"), updateOrderStatusController);
router.delete("/:id", authenticate("admin", "manager"), deleteOrderController);

export default router;
