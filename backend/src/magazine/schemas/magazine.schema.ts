import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MagazineDocument = Magazine & Document;

@Schema({ timestamps: true })
export class Magazine {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  issueNumber: string;

  @Prop({ required: true })
  editor: string;

  @Prop({ required: true, enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop({ required: true })
  pdf: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  uploadedAt: Date;

  @Prop({ required: true })
  size: number;

  // Common properties for audit
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  createdBy: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  updatedBy: any;

}

export const MagazineSchema = SchemaFactory.createForClass(Magazine);
