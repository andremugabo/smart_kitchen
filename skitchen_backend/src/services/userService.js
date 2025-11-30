import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import { User } from "../models/index.js";
// import redisClient from "../utils/redisClient.js"; // Redis client

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ---------------------------
// CREATE USER
// ---------------------------
export const createUser = async ({ username, email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = await User.create({
    username,
    email,
    password_hash: hashedPassword,
    role,
  });
  return newUser;
};

// ---------------------------
// LOGIN USER
// ---------------------------
export const loginUser = async ({ emailOrUsername, password }) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return { user, token };
};

// ---------------------------
// GET ALL USERS
// ---------------------------
export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: { exclude: ["password_hash"] },
    order: [["created_at", "DESC"]],
  });
  return users;
};

// ---------------------------
// GET USER BY ID
// ---------------------------
export const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password_hash"] },
  });
  if (!user) throw new Error("User not found");
  return user;
};

// ---------------------------
// UPDATE USER PROFILE
// ---------------------------
export const updateUser = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  await user.update(data);
  return user;
};

// ---------------------------
// UPDATE PASSWORD
// ---------------------------
export const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(oldPassword, user.password_hash);
  if (!match) throw new Error("Old password does not match");

  const hashed = await bcrypt.hash(newPassword, saltRounds);
  user.password_hash = hashed;
  await user.save();
  return user;
};

const otpStore = new Map();

// ---------------------------
// SEND OTP FOR PASSWORD RESET 
// ---------------------------
export const sendPasswordResetOtp = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Email not registered");

  const otp = crypto.randomInt(100000, 999999).toString();

  // Save OTP with expiry timestamp
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // TODO: send OTP via email
  console.log(`OTP for ${email}: ${otp}`);

  return { message: "OTP sent to email" };
};

// ---------------------------
// VERIFY OTP AND RESET PASSWORD 
// ---------------------------
export const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
  const record = otpStore.get(email);

  if (!record) throw new Error("OTP expired or not found");
  if (record.expiresAt < Date.now()) {
    otpStore.delete(email);
    throw new Error("OTP expired");
  }

  if (record.otp !== otp) throw new Error("Invalid OTP");

  const user = await User.findOne({ where: { email } });

  const hashed = await bcrypt.hash(newPassword, saltRounds);
  user.password_hash = hashed;
  await user.save();

  // Remove OTP after successful reset
  otpStore.delete(email);

  return user;
};


// ---------------------------
// UPDATE PROFILE IMAGE
// ---------------------------
export const updateUserImage = async (userId, imagePath) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  await user.update({ picture: imagePath });
  return user;
};

// ---------------------------
// DEACTIVATE / ACTIVATE USER
// ---------------------------
export const toggleUserActive = async (userId, isActive) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  await user.update({ isActive });
  return user;
};

// ---------------------------
// DELETE USER (soft delete)
// ---------------------------
export const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  await user.update({ deleted_at: new Date(), isActive: false });
  return user;
};
