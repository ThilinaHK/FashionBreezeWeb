const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User model
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'staff'], 
    default: 'staff' 
  },
  privileges: {
    products: { type: Boolean, default: false },
    categories: { type: Boolean, default: false },
    orders: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function testLogin() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const User = mongoose.model('User', userSchema);
    
    const email = 'admin@fashionbreeze.com';
    const password = '123';
    
    console.log('Testing login with:', { email, password });
    
    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('User data:', {
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status
    });
    
    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return;
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      console.log('❌ Account is inactive');
      return;
    }
    
    console.log('✅ Login should work!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testLogin();