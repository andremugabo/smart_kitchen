import {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  sendPasswordResetOtp,
  verifyOtpAndResetPassword,
  updateUserImage,
  toggleUserActive,
  deleteUser,
} from "../services/userService.js";

// ---------------------------
// CREATE USER
// POST /users
// ---------------------------
export const createUserController = async (req, res) => {
  try {
    const user = await createUser(req.body);
    const { password_hash, ...safeUser } = user.toJSON();
    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// LOGIN
// POST /users/login
// ---------------------------
export const loginController = async (req, res) => {
  try {
    const { emailOrUsername, email, username, password } = req.body;
    const identifier = emailOrUsername || email || username;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'emailOrUsername (or email/username) and password are required' });
    }
    const { user, token } = await loginUser({ emailOrUsername: identifier, password });
    const { password_hash, ...safeUser } = user.toJSON();
    res.json({ success: true, token, user: safeUser });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

// ---------------------------
// GET ALL USERS (PROTECTED, ADMIN ONLY)
// GET /users
// ---------------------------
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    const safeUsers = users.map(u => {
      const { password_hash, ...safeUser } = u.toJSON();
      return safeUser;
    });
    res.json({ success: true, users: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ---------------------------
// GET ONE USER
// GET /users/:id
// ---------------------------
export const getUserController = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    const { password_hash, ...safeUser } = user.toJSON();
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// ---------------------------
// UPDATE USER PROFILE
// PUT /users/:id
// ---------------------------
export const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id; // UUID

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own profile' 
      });
    }

    const user = await updateUser(userId, req.body);
    const { password_hash, ...safeUser } = user.toJSON();

    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// ---------------------------
// UPDATE PASSWORD
// PUT /users/:id/password
// ---------------------------
export const updatePasswordController = async (req, res) => {
  try {
    const userId = req.params.id; // UUID

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only change your own password' 
      });
    }

    const { oldPassword, newPassword } = req.body;
    await updatePassword(userId, oldPassword, newPassword);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// SEND OTP FOR PASSWORD RESET
// POST /users/password/otp
// ---------------------------
export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendPasswordResetOtp(email);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// VERIFY OTP AND RESET PASSWORD
// POST /users/password/reset
// ---------------------------
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    await verifyOtpAndResetPassword(email, otp, newPassword);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// UPDATE PROFILE IMAGE
// PUT /users/:id/image
// ---------------------------
export const updateImageController = async (req, res) => {
  try {
    if (!req.savedImagePath) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }
    const imagePath = req.savedImagePath;
    const user = await updateUserImage(req.params.id, imagePath);
    const { password_hash, ...safeUser } = user.toJSON();
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// DEACTIVATE / ACTIVATE USER
// PUT /users/:id/status
// ---------------------------
export const toggleActiveController = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await toggleUserActive(req.params.id, isActive);
    const { password_hash, ...safeUser } = user.toJSON();
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// DELETE USER (soft delete)
// DELETE /users/:id
// ---------------------------
export const deleteUserController = async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    const { password_hash, ...safeUser } = user.toJSON();
    res.json({ success: true, message: "User deleted successfully", user: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
