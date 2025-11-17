import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import { createImageUploadMiddleware } from "../middleware/imageUpload.js";
import {
  createUserController,
  loginController,
  getAllUsersController,
  getUserController,
  updateUserController,
  updatePasswordController,
  sendOtpController,
  verifyOtpController,
  updateImageController,
  toggleActiveController,
  deleteUserController,
} from '../controllers/userController.js';

const router = express.Router();

const [uploadProfileImage, processProfileImage] = createImageUploadMiddleware(
  "image",
  "users",
  { width: 512, maxSizeMB: 2 }
);

// Public routes
router.post('/', createUserController);
router.post('/login', loginController);
router.post('/password/otp', sendOtpController);
router.post('/password/reset', verifyOtpController);

// Protected routes
router.get('/', authenticate('admin', 'manager'), getAllUsersController);
router.get('/:id', authenticate(), getUserController);
router.put('/:id', authenticate(), updateUserController);
router.put('/:id/password', authenticate(), updatePasswordController);
router.put('/:id/image', authenticate(), uploadProfileImage, processProfileImage, updateImageController);
router.put('/:id/status', authenticate('admin'), toggleActiveController);
router.delete('/:id', authenticate('admin'), deleteUserController);

export default router;
