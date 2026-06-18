import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middlewares/auth.js';
const router = express.Router();
router.use(protect);
router.get('/', getWishlist);
router.post('/', toggleWishlist);
export default router;