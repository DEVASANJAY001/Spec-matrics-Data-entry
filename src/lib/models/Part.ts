import mongoose, { Schema, Document } from 'mongoose';

export interface IPart extends Document {
    name: string;
    categoryId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const PartSchema = new Schema<IPart>({
    name: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    createdAt: { type: Date, default: Date.now },
});

PartSchema.index({ name: 1, categoryId: 1 }, { unique: true });

export default mongoose.models.Part || mongoose.model<IPart>('Part', PartSchema);
