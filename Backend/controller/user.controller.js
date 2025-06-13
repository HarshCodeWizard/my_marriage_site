
import Hotel from '../model/hotels.model.js';
import Caterer from '../model/caterers.model.js';
import Decorator from '../model/decorators.model.js';
import User from '../model/user.model.js';
import bcrypt from 'bcrypt';

const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const hotels = await Hotel.find(
      { 'bookings.userId': userId },
      { 'bookings.$': 1, name: 1, price: 1 }
    );
    const caterers = await Caterer.find(
      { 'bookings.userId': userId },
      { 'bookings.$': 1, name: 1, price: 1 }
    );
    const decorators = await Decorator.find(
      { 'bookings.userId': userId },
      { 'bookings.$': 1, name: 1, price: 1 }
    );

    const formattedHotels = hotels.map(hotel => ({
      name: hotel.name,
      price: hotel.price,
      ...hotel.bookings[0],
    }));
    const formattedCaterers = caterers.map(caterer => ({
      name: caterer.name,
      price: caterer.price,
      ...caterer.bookings[0],
    }));
    const formattedDecorators = decorators.map(decorator => ({
      name: decorator.name,
      price: decorator.price,
      ...decorator.bookings[0],
    }));

    res.status(200).json({
      hotels: formattedHotels,
      caterers: formattedCaterers,
      decorators: formattedDecorators, // Fixed typo
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const Signup = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // Validate input fields
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'All required fields are required' });
    }

    // Validate role
    const validRoles = ['customer', 'vendor'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullname, // Fixed: use fullname
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { _id: newUser._id, fullname, email, role: newUser.role },
    });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request payload:', req.body);

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password); // Fixed typo
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    req.session.user = {
      _id: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };
    console.log('Session set:', req.session.user);

    
    // Return user details including role
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

export { getUserBookings, Signup, login };