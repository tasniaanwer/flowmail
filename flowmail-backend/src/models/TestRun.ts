import mongoose, { Document, Schema } from 'mongoose';

export interface ITestRun extends Document {
  automationId: mongoose.Types.ObjectId;
  email: string;
  status: 'running' | 'finished';
  startedAt: Date;
  finishedAt?: Date;
}

const TestRunSchema = new Schema<ITestRun>({
  automationId: {
    type: Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['running', 'finished'],
    default: 'running',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  finishedAt: {
    type: Date,
  },
});

export const TestRun = mongoose.model<ITestRun>('TestRun', TestRunSchema);

