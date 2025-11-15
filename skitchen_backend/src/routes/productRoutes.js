import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
  listProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
} from '../controllers/productController.js';

const router = express.Router();

// Public
router.get('/', listProductsController);
router.get('/:id', getProductController);

// Protected (admin/manager)
router.post('/', authenticate('admin', 'manager'), createProductController);
router.put('/:id', authenticate('admin', 'manager'), updateProductController);
router.delete('/:id', authenticate('admin', 'manager'), deleteProductController);

export default router;
