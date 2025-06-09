import Hotel from '../model/hotels.model.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const bookHotel = async (req, res) => {
  try {
    console.log('bookHotel called with:', req.body);
    const { userId, hotelId, date } = req.body;

    if (!userId || !hotelId || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Fetching hotel with ID:', hotelId);
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const newBooking = {
      userId,
      date: new Date(date),
      status: 'pending',
      createdAt: new Date(),
    };
    console.log('New booking:', newBooking);

    const shortReceipt = `hotel_${hotelId.slice(-8)}_${Date.now() % 10000}`;
    console.log('Generated receipt:', shortReceipt);

    console.log('Creating Razorpay order for amount:', hotel.price * 100);
    const order = await razorpay.orders.create({
      amount: hotel.price * 100, // Convert to paise
      currency: 'INR',
      receipt: shortReceipt,
      notes: { userId, hotelId },
    });
    console.log('Razorpay order created:', order.id);

    console.log('Saving hotel with new booking');
    hotel.bookings.push({ ...newBooking, paymentId: order.id });
    await hotel.save();
    console.log('Hotel saved successfully');

    const io = req.app.get('io');
    if (io) {
      console.log('Emitting bookingUpdate to userId:', userId);
      io.to(userId).emit('bookingUpdate', {
        status: 'pending',
        message: `Your hotel booking for ${hotel.name} is pending`,
      });
    }

    res.status(200).json({
      message: 'Booking created, proceed to payment',
      booking: newBooking,
      order,
    });
  } catch (error) {
    console.error('Error booking hotel:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export { getHotels, getHotelById, bookHotel };