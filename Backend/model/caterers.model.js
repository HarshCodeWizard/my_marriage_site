import mongoose from 'mongoose';

const catererSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  subImages: [{ type: String }], // Array of image URLs
  address: { type: String, required: true },
  latitude: { type: Number }, // Optional, can derive from location.coordinates
  longitude: { type: Number }, // Optional, can derive from location.coordinates
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Link to the vendor's user account
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

// Create geospatial index for location
catererSchema.index({ location: '2dsphere' });

// Pre-save hook to sync latitude/longitude with location.coordinates
catererSchema.pre('save', function (next) {
  if (this.location && this.location.coordinates) {
    this.longitude = this.location.coordinates[0]; // longitude
    this.latitude = this.location.coordinates[1]; // latitude
  }
  next();
});

const Caterer = mongoose.model('Caterer', catererSchema);
export default Caterer;