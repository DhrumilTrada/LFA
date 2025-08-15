import { Schema as MongooseSchema, Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type EditorialDocument = Editorial & Document;

@Schema({ timestamps: true })
export class Editorial {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop()
  excerpt?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop()
  featured?: boolean;

  @Prop()
  image?: string;

  @Prop()
  pdf?: string;

  @Prop()
  size?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  createdBy: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  updatedBy: any;
}

export const EditorialSchema = SchemaFactory.createForClass(Editorial);
