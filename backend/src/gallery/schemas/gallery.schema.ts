import { Schema as MongooseSchema, Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type GalleryDocument = Gallery & Document;

@Schema({ timestamps: true })
export class Gallery {
  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  createdBy: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  updatedBy: any;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
