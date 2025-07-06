import { Router } from "express";
import authController from "../controllers/authController.js";
const authRoutes = Router();

authRoutes.post('/user', authController.user_post)
authRoutes.post('/verify-token', authController.verify_token_post)
authRoutes.get('/user/:uid', authController.user_get)
authRoutes.post('/signup', authController.signup)
authRoutes.post('/signin', authController.signin)
authRoutes.get('/admin-verify', authController.admin_verify)

export default authRoutes;
