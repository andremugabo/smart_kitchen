import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/", authenticate("admin", "manager", "chef", "waiter"), getSettings);
router.put("/", authenticate("admin"), updateSettings);

export default router;
