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

// Admin/manager views and acts on requests
router.get("/", authenticate("admin", "manager"), listOrderChangeRequestsController);
router.post("/:id/approve", authenticate("admin", "manager"), approveOrderChangeRequestController);
router.post("/:id/reject", authenticate("admin", "manager"), rejectOrderChangeRequestController);

export default router;
