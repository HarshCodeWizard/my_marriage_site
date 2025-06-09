import express from 'express';
import { getHotels, getHotelById, bookHotel } from '../controller/hotels.controller.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/book', bookHotel);

export default router;