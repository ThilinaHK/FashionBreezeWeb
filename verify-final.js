const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  privileges: {
    products: { type: Boolean, default: false },
    categories: { type: Boolean, default: false },
    orders: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function verifyFinal() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const User = mongoose.model('User', userSchema);
    const admin = await User.findOne({ email: 'admin@fashionbreeze.com' });
    
    if (admin) {
      const isValid = await bcrypt.compare('123', admin.password);
      console.log('✅ Admin found and password valid:', isValid);
      console.log('Admin details:', {
        email: admin.email,
        username: admin.username,
        role: admin.role,
        status: admin.status
      });
    } else {
      console.log('❌ Admin not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyFinal();