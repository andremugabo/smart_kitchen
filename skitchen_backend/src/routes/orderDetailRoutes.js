import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listOrderDetailsByOrderController,
  getOrderDetailController,
  updateOrderDetailController,
  deleteOrderDetailController,
} from "../controllers/orderDetailController.js";

const router = express.Router();

router.get("/order/:orderId", listOrderDetailsByOrderController);
router.get("/:id", getOrderDetailController);

router.put("/:id", authenticate("admin", "manager", "waiter"), updateOrderDetailController);
router.delete("/:id", authenticate("admin", "manager"), deleteOrderDetailController);

export default router;
