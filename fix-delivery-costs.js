const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  image: String,
  icon: String,
  deliveryCost: { type: Number, default: 300 },
  subcategories: [{
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

async function fixDeliveryCosts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all categories with deliveryCost = 0 to 300
    const result = await Category.updateMany(
      { $or: [{ deliveryCost: 0 }, { deliveryCost: { $exists: false } }] },
      { $set: { deliveryCost: 300 } }
    );

    console.log(`Updated ${result.modifiedCount} categories with delivery cost 300`);

    // Show updated categories
    const categories = await Category.find({}, 'name deliveryCost');
    console.log('\nUpdated categories:');
    categories.forEach(cat => {
      console.log(`${cat.name}: LKR ${cat.deliveryCost}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixDeliveryCosts();