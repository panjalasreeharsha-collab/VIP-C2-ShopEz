
import express from 'express';
import { getPersonalizedRecommendations, handleAiChat } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';
const router = express.Router();
router.post('/chat', handleAiChat);
router.get('/recommendations', protect, getPersonalizedRecommendations);
export default router;