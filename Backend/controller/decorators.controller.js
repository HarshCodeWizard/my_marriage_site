import Decorator from '../model/decorators.model.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getDecorators = async (req, res) => {
  try {
    const decorators = await Decorator.find();
    res.status(200).json(decorators);
  } catch (error) {
    console.error('Error fetching decorators:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getDecoratorById = async (req, res) => {
  try {
    const decorator = await Decorator.findById(req.params.id);
    if (!decorator) {
      return res.status(404).json({ error: 'Decorator not found' });
    }
    res.status(200).json(decorator);
  } catch (error) {
    console.error('Error fetching decorator:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const bookDecorator = async (req, res) => {
  try {
    console.log('bookDecorator called with:', req.body);
    const { userId, decoratorId, date } = req.body;

    if (!userId || !decoratorId || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Fetching decorator with ID:', decoratorId);
    const decorator = await Decorator.findById(decoratorId);
    if (!decorator) {
      return res.status(404).json({ error: 'Decorator not found' });
    }

    const newBooking = {
      userId,
      date: new Date(date),
      status: 'pending',
      createdAt: new Date(),
    };
    console.log('New booking:', newBooking);

    const shortReceipt = `dec_${decoratorId.slice(-8)}_${Date.now() % 10000}`;
    console.log('Generated receipt:', shortReceipt);

    console.log('Creating Razorpay order for amount:', decorator.price * 100);
    const order = await razorpay.orders.create({
      amount: decorator.price * 100, // Convert to paise
      currency: 'INR',
      receipt: shortReceipt,
      notes: { userId, decoratorId },
    });
    console.log('Razorpay order created:', order.id);

    console.log('Saving decorator with new booking');
    decorator.bookings.push({ ...newBooking, paymentId: order.id });
    await decorator.save();
    console.log('Decorator saved successfully');

    const io = req.app.get('io');
    if (io) {
      console.log('Emitting bookingUpdate to userId:', userId);
      io.to(userId).emit('bookingUpdate', {
        status: 'pending',
        message: `Your decorator booking for ${decorator.name} is pending`,
      });
    }

    res.status(200).json({
      message: 'Booking created, proceed to payment',
      booking: newBooking,
      order,
    });
  } catch (error) {
    console.error('Error booking decorator:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export { getDecorators, getDecoratorById, bookDecorator };