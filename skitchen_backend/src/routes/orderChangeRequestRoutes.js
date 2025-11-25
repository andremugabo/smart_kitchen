import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  createOrderChangeRequestController,
  listOrderChangeRequestsController,
  approveOrderChangeRequestController,
  rejectOrderChangeRequestController,
} from "../controllers/orderChangeRequestController.js";

const router = express.Router();

// Waiter creates request
router.post("/", authenticate("waiter", "admin", "manager"), createOrderChangeRequestController);

// Admin/manager/waiter can view requests; only admin/manager can approve/reject
router.get("/", authenticate("admin", "manager", "waiter"), listOrderChangeRequestsController);
router.post("/:id/approve", authenticate("admin", "manager"), approveOrderChangeRequestController);
router.post("/:id/reject", authenticate("admin", "manager"), rejectOrderChangeRequestController);

export default router;
