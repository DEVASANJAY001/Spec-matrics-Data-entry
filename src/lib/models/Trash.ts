import mongoose, { Schema, Document } from 'mongoose';

export interface ITrash extends Document {
    originalId: mongoose.Types.ObjectId;
    collectionName: 'specifications' | 'inspections';
    data: any;
    type: 'Master' | 'Log';
    identifier: string; // Code for Specs, VIN:Code for Inspections
    deletedAt: Date;
}

const TrashSchema = new Schema<ITrash>({
    originalId: { type: Schema.Types.ObjectId, required: true },
    collectionName: { type: String, required: true, enum: ['specifications', 'inspections'] },
    data: { type: Schema.Types.Mixed, required: true },
    type: { type: String, required: true, enum: ['Master', 'Log'] },
    identifier: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now, index: { expires: '7d' } } // 7-day TTL
});

export default mongoose.models.Trash || mongoose.model<ITrash>('Trash', TrashSchema);
