import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
  listInventoryController,
  getInventoryByProductController,
  setInventoryQuantityController,
  incrementInventoryController,
  decrementInventoryController,
} from '../controllers/inventoryController.js';

const router = express.Router();

// Public
router.get('/', listInventoryController);
router.get('/:product_id', getInventoryByProductController);

// Protected (admin/manager)
router.put('/:product_id/set', authenticate('admin', 'manager'), setInventoryQuantityController);
router.patch('/:product_id/increment', authenticate('admin', 'manager'), incrementInventoryController);
router.patch('/:product_id/decrement', authenticate('admin', 'manager'), decrementInventoryController);

export default router;
