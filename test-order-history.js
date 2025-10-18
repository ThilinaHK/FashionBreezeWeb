const mongoose = require('mongoose');

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

async function testOrderHistory() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const OrderHistory = mongoose.model('OrderHistory', OrderHistorySchema);
    
    // Check if any order history exists
    const historyCount = await OrderHistory.countDocuments();
    console.log('Total order history records:', historyCount);
    
    // Get recent history
    const recentHistory = await OrderHistory.find({}).sort({ timestamp: -1 }).limit(5);
    console.log('Recent history:', recentHistory);
    
    // Check for any errors in the collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasOrderHistory = collections.some(col => col.name === 'orderhistories');
    console.log('OrderHistory collection exists:', hasOrderHistory);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testOrderHistory();