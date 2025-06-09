import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: function () {
      return !this.googleId; // Fullname required only for non-Google users
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only for non-Google users
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values for non-Google users
  },
});

const User = mongoose.model("User", userSchema);

export default User;