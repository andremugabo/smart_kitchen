import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
  listPurchasesController,
  getPurchaseController,
  createPurchaseController,
  uploadPurchaseProof,
} from '../controllers/purchaseHistoryController.js';

const router = express.Router();

// Public
router.get('/', listPurchasesController);
router.get('/:id', getPurchaseController);

// Protected (admin/manager) - with proof image upload under field name 'proof'
router.post('/', authenticate('admin', 'manager'), uploadPurchaseProof.single('proof'), createPurchaseController);

export default router;
