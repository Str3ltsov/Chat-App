import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/AuthController.js'

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgotpassword', forgotPassword);
authRouter.put('/resetpassword/:resetPasswordToken', resetPassword);