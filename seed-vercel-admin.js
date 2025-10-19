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

async function seedVercelAdmin() {
  try {
    // Connect to default database (what Vercel is probably using)
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    
    const User = mongoose.model('User', userSchema);
    
    // Delete existing admin
    await User.deleteMany({ email: 'admin@fashionbreeze.com' });
    
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const adminUser = new User({
      id: 1,
      username: 'admin',
      email: 'admin@fashionbreeze.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      privileges: {
        products: true,
        categories: true,
        orders: true,
        customers: true,
        users: true,
        analytics: true
      }
    });
    
    await adminUser.save();
    console.log('✅ Admin user created in default database');
    
    // Also try fashionBreeze database
    await mongoose.disconnect();
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const User2 = mongoose.model('User2', userSchema);
    await User2.deleteMany({ email: 'admin@fashionbreeze.com' });
    
    const adminUser2 = new User2({
      id: 1,
      username: 'admin',
      email: 'admin@fashionbreeze.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      privileges: {
        products: true,
        categories: true,
        orders: true,
        customers: true,
        users: true,
        analytics: true
      }
    });
    
    await adminUser2.save();
    console.log('✅ Admin user created in fashionBreeze database');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedVercelAdmin();