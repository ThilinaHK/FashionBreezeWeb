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
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'customer_verified', 'cancelled'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'bank_transfer', 'card_payment', 'mobile_payment'],
    default: 'cash_on_delivery',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paymentSlip: {
    filename: String,
    imageData: String,
    uploadedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  deliveryVerified: {
    type: Boolean,
    default: false,
  },
  customerNotes: String,
  verifiedAt: Date,
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);