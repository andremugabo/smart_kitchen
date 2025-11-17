import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import { createImageUploadMiddleware } from "../middleware/imageUpload.js";
import {
  listProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
} from '../controllers/productController.js';

const router = express.Router();

const [uploadProductImage, processProductImage] = createImageUploadMiddleware(
  "picture",
  "products",
  { width: 800, maxSizeMB: 3 }
);

// Public
router.get('/', listProductsController);
router.get('/:id', getProductController);

// Protected (admin/manager)
router.post('/', authenticate('admin', 'manager'), uploadProductImage, processProductImage, createProductController);
router.put('/:id', authenticate('admin', 'manager'), uploadProductImage, processProductImage, updateProductController);
router.delete('/:id', authenticate('admin', 'manager'), deleteProductController);

export default router;
