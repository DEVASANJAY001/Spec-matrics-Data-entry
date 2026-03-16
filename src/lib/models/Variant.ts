import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant extends Document {
    name: string;
    carModelId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const VariantSchema = new Schema<IVariant>({
    name: { type: String, required: true, trim: true },
    carModelId: { type: Schema.Types.ObjectId, ref: 'CarModel' },
    createdAt: { type: Date, default: Date.now },
});

// Ensure unique combination of name and carModelId if we want to link them loosely
VariantSchema.index({ name: 1, carModelId: 1 }, { unique: true });

export default mongoose.models.Variant || mongoose.model<IVariant>('Variant', VariantSchema);
