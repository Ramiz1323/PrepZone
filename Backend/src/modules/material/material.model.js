import mongoose from 'mongoose';

export const SUBJECT_ENUM = [
  'C Programming',
  'OOP',
  'Unix',
  'Data Structures',
  'Computer Intro',
  'Operating System',
  'Computer Network',
  'DBMS',
  'Software Engineering',
  'Machine Learning',
  'Others',
];

const materialSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: {
        values: SUBJECT_ENUM,
        message: 'Invalid subject selected',
      },
      default: 'Others',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileId: {
      type: String,
      required: [true, 'ImageKit file ID is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user fast queries filtered/sorted by subject & creation date
materialSchema.index({ user: 1, subject: 1, createdAt: -1 });
materialSchema.index({ user: 1, title: 'text' });

export const Material = mongoose.model('Material', materialSchema);
