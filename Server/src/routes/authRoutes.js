import express from 'express';
import { signup, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetpassword } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-verify-otp', userAuth, sendVerifyOtp);
router.post('/verify-account', userAuth, verifyEmail);
router.get('/is-auth', userAuth, isAuthenticated);
router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetpassword);


export default router;