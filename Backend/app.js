import './config/env.js';
import express from 'express';
import hotelsroute from './route/hotels.route.js';
import userroute from './route/user.route.js';
import caterersroute from './route/caterers.route.js';
import decoratorsroute from './route/decorators.route.js';
import cors from 'cors';
import session from 'express-session';
import passport from './passport.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import crypto from 'crypto';
import Hotel from './model/hotels.model.js';
import Caterer from './model/caterers.model.js';
import Decorator from './model/decorators.model.js';
// import admin from './firebaseAdmin.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/hotels', hotelsroute);
app.use('/user', userroute);
app.use('/caterers', caterersroute);
app.use('/decorators', decoratorsroute);

// Verify Payment Endpoint
app.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;
    console.log('Verifying payment:', { paymentId, orderId });

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.error('Invalid payment signature:', { orderId, paymentId });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Find and update booking
    const models = [Hotel, Caterer, Decorator];
    let booking = null;
    let item = null;
    for (const Model of models) {
      item = await Model.findOne({ 'bookings.paymentId': orderId });
      if (item) {
        booking = item.bookings.find((b) => b.paymentId === orderId);
        if (booking) {
          booking.status = 'confirmed';
          await item.save();
          break;
        }
      }
    }

    if (!booking) {
      console.error('Booking not found for orderId:', orderId);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Emit Socket.IO event
    io.to(booking.userId).emit('bookingUpdate', {
      bookingId: booking._id,
      status: booking.status,
      message: `Your booking is confirmed!`,
    });
    console.log('Booking confirmed, emitted to user:', booking.userId);

    // Firebase notification (if enabled)
    /*
    if (booking.userId) {
      const user = await User.findById(booking.userId);
      if (user && user.fcmToken) {
        const message = {
          notification: {
            title: 'Booking Confirmed',
            body: 'Your booking has been successfully confirmed!',
          },
          token: user.fcmToken,
        };
        await admin.messaging().send(message);
        console.log('Notification sent to user:', booking.userId);
      }
    }
    */

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.set('io', io);

export { app, server, io };