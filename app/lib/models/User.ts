import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  address: {
    line1: { type: String, required: true },
    line2: String,
    line3: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);