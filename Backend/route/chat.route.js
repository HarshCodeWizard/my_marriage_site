import express from 'express';
import { startChat, sendMessage, getChats } from '../controller/chat.controller.js';

const router = express.Router();

const authenticate = (req, res, next) => {
    console.log('Session in chat.route.js:', req.session);
    console.log('Session user:', req.session.user);
    console.log('Cookies:', req.headers.cookie);
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log('Authenticated user for route:', req.params.userId || req.body.customerId);
    next();
  };

router.post('/start', authenticate, startChat);
router.post('/message', authenticate, sendMessage);
router.get('/history/:userId', authenticate, getChats);

export default router;