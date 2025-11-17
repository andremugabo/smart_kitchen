import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listMenuCategoriesController,
  getMenuCategoryController,
  createMenuCategoryController,
  updateMenuCategoryController,
  deleteMenuCategoryController,
} from "../controllers/menuCategoryController.js";

const router = express.Router();

router.get("/", listMenuCategoriesController);
router.get("/:id", getMenuCategoryController);
router.post("/", authenticate("admin", "manager"), createMenuCategoryController);
router.put("/:id", authenticate("admin", "manager"), updateMenuCategoryController);
router.delete("/:id", authenticate("admin", "manager"), deleteMenuCategoryController);

export default router;