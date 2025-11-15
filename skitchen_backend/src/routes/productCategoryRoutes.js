import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
  listProductCategoriesController,
  getProductCategoryController,
  createProductCategoryController,
  updateProductCategoryController,
  deleteProductCategoryController,
} from '../controllers/productCategoryController.js';

const router = express.Router();

// Public
router.get('/', listProductCategoriesController);
router.get('/:id', getProductCategoryController);

// Protected (admin/manager)
router.post('/', authenticate('admin', 'manager'), createProductCategoryController);
router.put('/:id', authenticate('admin', 'manager'), updateProductCategoryController);
router.delete('/:id', authenticate('admin', 'manager'), deleteProductCategoryController);

export default router;
