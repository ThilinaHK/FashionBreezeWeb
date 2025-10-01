import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  code: String,
  price: { type: Number, required: true },
  image: String,
  size: String,
  category: String,
  quantity: { type: Number, required: true },
  selectedSizeData: {
    size: String,
    stock: Number,
    price: Number
  }
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered'], default: 'pending' },
  whatsappSent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);