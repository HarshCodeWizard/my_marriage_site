import Caterer from '../model/caterers.model.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getCaterers = async (req, res) => {
  try {
    const caterers = await Caterer.find();
    res.status(200).json(caterers);
  } catch (error) {
    console.error('Error fetching caterers:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCatererById = async (req, res) => {
  try {
    const caterer = await Caterer.findById(req.params.id);
    if (!caterer) {
      return res.status(404).json({ error: 'Caterer not found' });
    }
    res.status(200).json(caterer);
  } catch (error) {
    console.error('Error fetching caterer:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const bookCaterer = async (req, res) => {
  try {
    console.log('bookCaterer called with:', req.body);
    const { userId, catererId, date } = req.body;

    if (!userId || !catererId || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Fetching caterer with ID:', catererId);
    const caterer = await Caterer.findById(catererId);
    if (!caterer) {
      return res.status(404).json({ error: 'Caterer not found' });
    }

    const newBooking = {
      userId,
      date: new Date(date),
      status: 'pending',
      createdAt: new Date(),
    };
    console.log('New booking:', newBooking);

    const shortReceipt = `cat_${catererId.slice(-8)}_${Date.now() % 10000}`;
    console.log('Generated receipt:', shortReceipt);

    console.log('Creating Razorpay order for amount:', caterer.price * 100);
    const order = await razorpay.orders.create({
      amount: caterer.price * 100, // Convert to paise
      currency: 'INR',
      receipt: shortReceipt,
      notes: { userId, catererId },
    });
    console.log('Razorpay order created:', order.id);

    console.log('Saving caterer with new booking');
    caterer.bookings.push({ ...newBooking, paymentId: order.id });
    await caterer.save();
    console.log('Caterer saved successfully');

    const io = req.app.get('io');
    if (io) {
      console.log('Emitting bookingUpdate to userId:', userId);
      io.to(userId).emit('bookingUpdate', {
        status: 'pending',
        message: `Your caterer booking for ${caterer.name} is pending`,
      });
    }

    res.status(200).json({
      message: 'Booking created, proceed to payment',
      booking: newBooking,
      order,
    });
  } catch (error) {
    console.error('Error booking caterer:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export { getCaterers, getCatererById, bookCaterer };