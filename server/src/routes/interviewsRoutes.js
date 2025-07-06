import { Router } from "express";
import InterviewsController from "../controllers/InterviewsController.js";

const InterviewsRoutes = Router();

InterviewsRoutes.get('/', InterviewsController.getInterviews);
InterviewsRoutes.get('/search', InterviewsController.searchInterviews);
InterviewsRoutes.get('/user-interviews', InterviewsController.userInterviews);
InterviewsRoutes.get('/trending', InterviewsController.getTrendingInterviews);
InterviewsRoutes.get('/:id', InterviewsController.interviewById);
InterviewsRoutes.post('/', InterviewsController.createInterview);
InterviewsRoutes.post('/:id/like', InterviewsController.likeInterview);
InterviewsRoutes.put('/:id', InterviewsController.updateInterview);
InterviewsRoutes.delete('/:id', InterviewsController.deleteInterview);

export default InterviewsRoutes;
