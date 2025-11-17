import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { createImageUploadMiddleware } from "../middleware/imageUpload.js";
import {
  listMenusController,
  getMenuController,
  createMenuController,
  updateMenuController,
  deleteMenuController,
  getMenuProfitController,
} from "../controllers/menuController.js";

const router = express.Router();

const [uploadMenuImage, processMenuImage] = createImageUploadMiddleware(
  "picture",
  "menus",
  { width: 800, maxSizeMB: 3 }
);

router.get("/", listMenusController);
router.get("/:id", getMenuController);
router.get("/:id/profit", getMenuProfitController);

router.post("/", authenticate("admin", "manager"), uploadMenuImage, processMenuImage, createMenuController);
router.put("/:id", authenticate("admin", "manager"), uploadMenuImage, processMenuImage, updateMenuController);
router.delete("/:id", authenticate("admin", "manager"), deleteMenuController);

export default router;