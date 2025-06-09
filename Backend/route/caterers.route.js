import express from 'express';
import { getCaterers, getCatererById, bookCaterer } from '../controller/caterers.controller.js';

const router = express.Router();

router.get('/', getCaterers);
router.get('/:id', getCatererById);
router.post('/book', bookCaterer);

export default router;