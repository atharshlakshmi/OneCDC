import mongoose, { Schema, Model } from 'mongoose';
import { IReport, ReportCategory, ReportStatus } from '../types';

/**
 * Report Schema
 */
const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['review', 'shop'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    category: {
      type: String,
      enum: Object.values(ReportCategory),
      required: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    timestamp: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    resolution: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ timestamp: -1 });
ReportSchema.index({ reviewedBy: 1 });

/**
 * Report Model
 */
export const Report: Model<IReport> = mongoose.model<IReport>(
  'Report',
  ReportSchema
);
