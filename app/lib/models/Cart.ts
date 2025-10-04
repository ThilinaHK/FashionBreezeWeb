import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  code: String,
  price: Number,
  quantity: Number,
  size: String,
  image: String,
  category: String,
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);