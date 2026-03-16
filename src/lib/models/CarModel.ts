import mongoose, { Schema, Document } from 'mongoose';

export interface ICarModel extends Document {
    name: string;
    createdAt: Date;
}

const CarModelSchema = new Schema<ICarModel>({
    name: { type: String, required: true, unique: true, trim: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.CarModel || mongoose.model<ICarModel>('CarModel', CarModelSchema);
