import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  subImages: [{ type: String }],
  address: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Link to the vendor's user account
  },
  bookings: [
    {
      userId: { type: String, required: true },
      date: { type: Date, required: true },
      status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
      paymentId: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

hotelSchema.index({ location: '2dsphere' });

hotelSchema.pre('save', function (next) {
  if (this.location && this.location.coordinates) {
    this.longitude = this.location.coordinates[0];
    this.latitude = this.location.coordinates[1];
  }
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;