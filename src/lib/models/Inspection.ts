import mongoose, { Schema, Document } from 'mongoose';

export interface IInspectionItem {
    partId?: mongoose.Types.ObjectId;
    partName: string;
    spec: string;
    image?: string;
    status: 'correct' | 'wrong';
    isCustom?: boolean;
}

export interface IInspection extends Document {
    vin: string;
    lcdv: string;
    variant: string;
    region: string;
    carModel?: string;
    code: string;
    inspector: string;
    date: Date;
    items: IInspectionItem[];
    totalCorrect: number;
    totalWrong: number;
    wrongPartDetails: string;
    addedParts: string[];
    removedParts: string[];
    summary: string;
    duration: number;
    startedAt?: Date;
    endedAt?: Date;
    createdAt: Date;
}

const InspectionSchema = new Schema<IInspection>({
    vin: { type: String, required: true, index: true },
    lcdv: { type: String, required: true },
    variant: { type: String },
    region: { type: String },
    carModel: { type: String },
    code: { type: String, required: true, index: true },
    inspector: { type: String },
    date: { type: Date, default: Date.now },
    items: [{
        partId: { type: Schema.Types.ObjectId, ref: 'Part' },
        partName: { type: String, required: true },
        spec: { type: String, default: '' },
        status: { type: String, enum: ['correct', 'wrong'], required: true },
        image: { type: String },
        isCustom: { type: Boolean, default: false }
    }],
    totalCorrect: { type: Number, default: 0 },
    totalWrong: { type: Number, default: 0 },
    wrongPartDetails: { type: String },
    addedParts: [{ type: String }],
    removedParts: [{ type: String }],
    summary: { type: String },
    duration: { type: Number, default: 0 },
    startedAt: { type: Date },
    endedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, index: true },
});

// Compound index for dashboard today stats query (most frequent)
InspectionSchema.index({ createdAt: -1 });

export default mongoose.models.Inspection_v2 || mongoose.model<IInspection>('Inspection_v2', InspectionSchema, 'inspections');
