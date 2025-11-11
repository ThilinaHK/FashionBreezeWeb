import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const CategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  image: String,
  icon: String,
  subcategories: [SubCategorySchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  deliveryCost: {
    type: Number,
    default: 300,
    min: 0,
  },
}, {
  timestamps: true,
});

CategorySchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.deliveryCost === undefined || ret.deliveryCost === null) {
      ret.deliveryCost = 300;
    }
    return ret;
  }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);