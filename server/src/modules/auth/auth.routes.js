import express from "express";
import userAuth from "../modules/auth/auth.middleware.js";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  getCurrentUser,
  sendResetOtp,
  resetPassword,
} from "../modules/auth/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.get("/me", userAuth, getCurrentUser);

authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);

authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;