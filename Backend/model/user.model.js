import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['customer', 'vendor'],
    default: 'customer',
  },
});

const User = mongoose.model('User', userSchema);
export default User;