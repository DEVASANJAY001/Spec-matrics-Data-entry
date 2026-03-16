import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecification extends Document {
    // References (for relational power)
    carModelId: mongoose.Types.ObjectId;
    variantId: mongoose.Types.ObjectId;
    regionId: mongoose.Types.ObjectId;
    partId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;

    // Flat Fields (For "Excel-like" columnar storage - MATCHING HEADERS EXACTLY)
    'Car Model': string;
    'Variant': string;
    'Region': string;
    'Code': string;
    'Category': string;
    'Part Name': string;
    'Specification Details': string;
    'Documentation Image': string;

    createdAt: Date;
}

const SpecificationSchema = new Schema<ISpecification>({
    carModelId: { type: Schema.Types.ObjectId, ref: 'CarModel', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    partId: { type: Schema.Types.ObjectId, ref: 'Part', required: true },

    'Car Model': { type: String, required: true },
    'Variant': { type: String, required: true },
    'Region': { type: String, required: true },
    'Code': { type: String, required: true },
    'Category': { type: String, required: true },
    'Part Name': { type: String, required: true },
    'Specification Details': { type: String, required: true },
    'Documentation Image': { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Specification || mongoose.model<ISpecification>('Specification', SpecificationSchema);
