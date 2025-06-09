import express from 'express';
import { getDecorators, getDecoratorById, bookDecorator } from '../controller/decorators.controller.js';

const router = express.Router();

router.get('/', getDecorators);
router.get('/:id', getDecoratorById);
router.post('/book', bookDecorator);

export default router;