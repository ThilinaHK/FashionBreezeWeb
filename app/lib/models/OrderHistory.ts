import mongoose from 'mongoose';

const OrderHistorySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  previousStatus: {
    type: String,
    required: true,
  },
  newStatus: {
    type: String,
    required: true,
  },
  changedBy: {
    userId: String,
    username: String,
  },
  reason: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.OrderHistory || mongoose.model('OrderHistory', OrderHistorySchema);