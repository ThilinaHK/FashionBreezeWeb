import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true,
  },
  name: {
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
  phone: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    line1: String,
    line2: String,
    line3: String,
  },
  deliveryAddress: {
    country: String,
    region: String,
    district: String,
    city: String,
    cityId: Number,
    addressLine: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export default Customer;
export { Customer };