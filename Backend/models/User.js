const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  name: { type: String, default: 'Anonymous' },
  state: { type: String },
  district: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  // Department explicit schemas
  block: { type: String },
  panchayat: { type: String },
  designation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
