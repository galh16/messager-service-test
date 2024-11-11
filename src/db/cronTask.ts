import mongoose, { Document } from 'mongoose';

export interface ICronJob extends Document {
    name: string,
    type: string,
    taskSchedule: string,
    user_id: string,
    response: string,
    sentTryCount: Number,
    retryType: string,
    description: string,
    status: string
  }

const CronTaskSchema = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    taskSchedule: {type: String, required: true}, // format cron (e.g., '*/5 * * * *')
    user_id: {type: String, required: true},
    response: {type: String, required: true},
    sentTryCount: {type: Number, required: true},
    retryType: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true}
});

export default mongoose.model<ICronJob>('CronJob', CronTaskSchema);