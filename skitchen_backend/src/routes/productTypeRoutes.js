import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
  listProductTypesController,
  getProductTypeController,
  createProductTypeController,
  updateProductTypeController,
  deleteProductTypeController,
} from '../controllers/productTypeController.js';

const router = express.Router();

// Public
router.get('/', listProductTypesController);
router.get('/:id', getProductTypeController);

// Protected (admin/manager)
router.post('/', authenticate('admin', 'manager'), createProductTypeController);
router.put('/:id', authenticate('admin', 'manager'), updateProductTypeController);
router.delete('/:id', authenticate('admin', 'manager'), deleteProductTypeController);

export default router;
