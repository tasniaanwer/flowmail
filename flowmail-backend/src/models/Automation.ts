import mongoose, { Document, Schema } from 'mongoose';

export interface IAutomation extends Document {
  name: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: Date;
}

const AutomationSchema = new Schema<IAutomation>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
  // Mongoose v8 has stricter TS types; this is still stored as an array of Mixed values at runtime.
  nodes: {
    type: [Schema.Types.Mixed],
    required: true,
    default: [],
  } as any,
  edges: {
    type: [Schema.Types.Mixed],
    required: true,
    default: [],
  } as any,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Automation = mongoose.model<IAutomation>('Automation', AutomationSchema);

