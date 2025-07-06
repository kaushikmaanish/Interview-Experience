import { Router } from "express";
import auth from "../middleware/firebase.js";
import UserController from "../controllers/userController.js";
const userRoutes = Router();

userRoutes.get('/profile', auth, UserController.profile)
userRoutes.get('/interviews', auth, UserController.interviews)
userRoutes.put('/profile', auth, UserController.profile_update)
userRoutes.get('/profile-data', auth, UserController.profile_data)
userRoutes.get('/stats', auth, UserController.stats)
userRoutes.get("/photos", UserController.latestUserPhotos);

export default userRoutes;
