import mongoose from 'mongoose';

// Delete the old model to avoid conflicts
if (mongoose.models.Address) {
  delete mongoose.models.Address;
}

const AddressSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['country', 'region', 'district', 'city'] },
  parentId: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String },
  updatedBy: { type: String }
});

AddressSchema.index({ id: 1 });
AddressSchema.index({ type: 1 });
AddressSchema.index({ parentId: 1 });
AddressSchema.index({ isActive: 1 });

export default mongoose.model('Address', AddressSchema);