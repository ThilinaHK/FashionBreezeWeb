import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  id: Number,
  productId: String,
  name: String,
  code: String,
  price: Number,
  quantity: Number,
  size: String,
  color: String,
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
  subtotal: {
    type: Number,
    default: 0,
  },
  deliveryCost: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);