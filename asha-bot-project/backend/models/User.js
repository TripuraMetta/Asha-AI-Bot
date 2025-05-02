const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  otp: String,
  otpExpires: Date,
});

module.exports = mongoose.model('User', userSchema);