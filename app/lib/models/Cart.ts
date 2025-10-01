import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  code: String,
  price: { type: Number, required: true },
  image: String,
  size: String,
  category: String,
  quantity: { type: Number, required: true, default: 1 },
  selectedSizeData: {
    size: String,
    stock: Number,
    price: Number
  }
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [cartItemSchema],
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);