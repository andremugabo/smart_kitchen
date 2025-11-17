import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listUnitsController,
  getUnitController,
  createUnitController,
  updateUnitController,
  deleteUnitController,
} from "../controllers/unitController.js";

const router = express.Router();

// Public
router.get("/", listUnitsController);
router.get("/:id", getUnitController);

// Protected
router.post("/", authenticate("admin", "manager"), createUnitController);
router.put("/:id", authenticate("admin", "manager"), updateUnitController);
router.delete("/:id", authenticate("admin", "manager"), deleteUnitController);

export default router;