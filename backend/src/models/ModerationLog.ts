import mongoose, { Schema, Model } from 'mongoose';
import { IModerationLog, ModerationAction } from '../types';

/**
 * Moderation Log Schema
 */
const ModerationLogSchema = new Schema<IModerationLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: Object.values(ModerationAction),
      required: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'shop', 'review'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    relatedReport: { type: Schema.Types.ObjectId, ref: 'Report' },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    details: { type: String, trim: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ModerationLogSchema.index({ admin: 1 });
ModerationLogSchema.index({ action: 1 });
ModerationLogSchema.index({ targetType: 1, targetId: 1 });
ModerationLogSchema.index({ timestamp: -1 });
ModerationLogSchema.index({ relatedReport: 1 });

/**
 * Moderation Log Model
 */
export const ModerationLog: Model<IModerationLog> =
  mongoose.model<IModerationLog>('ModerationLog', ModerationLogSchema);
