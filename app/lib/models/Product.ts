import mongoose from 'mongoose';

const SizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  colors: [{
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
});

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  shortDescription: String,
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  promoCode: String,
  category: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  subcategory: {
    type: String,
  },
  brand: String,
  tags: [String],
  image: {
    type: String,
    required: true,
  },
  additionalImages: [String],
  sizes: [SizeSchema],
  colors: [{
    name: String,
    code: String,
    image: String,
  }],
  specifications: {
    material: String,
    careInstructions: String,
    origin: String,
    weight: String,
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'outofstock'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  }],
  inventory: {
    totalStock: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
  },
  cost: {
    type: Number,
    default: 0,
  },
  vat: {
    type: Number,
    default: 0,
  },
  pricing: {
    costPrice: Number,
    profitMargin: Number,
    taxRate: {
      type: Number,
      default: 0,
    },
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ status: 1, visibility: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ 'rating.average': -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });

// Virtual for total stock calculation
ProductSchema.virtual('totalStock').get(function() {
  return this.sizes.reduce((total, size) => total + size.stock, 0);
});

// Virtual for in stock status
ProductSchema.virtual('inStock').get(function() {
  return (this.inventory?.totalStock || 0) > 0;
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);