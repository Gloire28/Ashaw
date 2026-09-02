import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Le "tableau des réservations" est entièrement géré par l'admin
router.use(protectAdmin);

router.get('/', getBookings);
router.post('/', createBooking);
router.patch('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;
