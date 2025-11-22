const mongoose = require('mongoose');

// Connect to MongoDB
async function testProductUpdate() {
  try {
    // Use the same connection string from your .env.local
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionbreeze';
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the Product schema (simplified)
    const ProductSchema = new mongoose.Schema({
      id: Number,
      name: String,
      code: String,
      description: String,
      price: Number,
      category: mongoose.Schema.Types.Mixed,
      subcategory: String,
      image: String,
      specifications: {
        material: String,
        careInstructions: String,
        origin: String,
        weight: String,
      },
      status: String,
    }, { timestamps: true });

    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    // Find a product to test with
    const testProduct = await Product.findOne();
    if (!testProduct) {
      console.log('No products found in database');
      return;
    }

    console.log('Found test product:', testProduct.name);
    console.log('Current specifications:', testProduct.specifications);

    // Test updating the product with new specifications
    const updateData = {
      description: 'Updated product description - test',
      specifications: {
        material: 'Premium Cotton Blend',
        careInstructions: 'Machine wash cold, tumble dry low',
        origin: 'Sri Lanka',
        weight: 'Regular Fit - 200g'
      }
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      testProduct._id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Product updated successfully!');
    console.log('New description:', updatedProduct.description);
    console.log('New specifications:', updatedProduct.specifications);

    // Test with numeric ID as well
    if (testProduct.id) {
      const updatedByNumericId = await Product.findOneAndUpdate(
        { id: testProduct.id },
        { 
          description: 'Updated via numeric ID',
          specifications: {
            material: 'Test Material',
            careInstructions: 'Test Care',
            origin: 'Test Origin',
            weight: 'Test Weight'
          }
        },
        { new: true, runValidators: true }
      );
      
      console.log('Update via numeric ID successful:', updatedByNumericId ? 'Yes' : 'No');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testProductUpdate();