import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Govt', 'Govt Aided', 'Private'],
  },
  tier: {
    type: String,
    required: true,
  },
  cutoff: {
    type: Number,
    required: true,
  },
  minCutoff: {
    type: Number,
    required: true,
    default: 1,
  },
}, {
  timestamps: true,
});

// Index for performance
collegeSchema.index({ name: 1 });

const College = mongoose.model('College', collegeSchema);

export default College;
