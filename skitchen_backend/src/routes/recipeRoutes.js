import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  listRecipesController,
  getRecipeController,
  createRecipeController,
  updateRecipeController,
  deleteRecipeController,
  listRecipesByMenuController,
} from "../controllers/recipeController.js";

const router = express.Router();

router.get("/", listRecipesController);
router.get("/:id", getRecipeController);
router.get("/menu/:menuId", listRecipesByMenuController);

router.post("/", authenticate("admin", "manager"), createRecipeController);
router.put("/:id", authenticate("admin", "manager"), updateRecipeController);
router.delete("/:id", authenticate("admin", "manager"), deleteRecipeController);

export default router;
