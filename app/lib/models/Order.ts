import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  code: String,
  price: Number,
  quantity: Number,
  size: String,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true,
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  userId: {
    type: String,
    required: true,
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);