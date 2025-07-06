import { Router } from "express";
import auth from "../middleware/firebase.js";
import chatController from "../controllers/chatController.js";
const chatRoutes = Router();

chatRoutes.post('/', auth, chatController.chat_post)

export default chatRoutes;
