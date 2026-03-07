import express from  'express'
import { getCurrentUser, isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from './auth.controller.js';
import userAuth from './auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/me', getCurrentUser );
authRouter.post('/register', register );
authRouter.post('/login', login );
authRouter.post('/logout', logout );
authRouter.post('/sent-verify-otp', userAuth, sendVerifyOtp );
authRouter.post('/verify-account', userAuth, verifyEmail );
authRouter.post('/is-auth', userAuth, isAuthenticated );
authRouter.post('/send-reset-otp', sendResetOtp );
authRouter.post('/reset-password', resetPassword );

export default authRouter;