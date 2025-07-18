import { Schema as MongooseSchema, Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type FormDocument = Form & Document;

@Schema({ timestamps: true, strict: false })
export class Form {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Object })
  schema: Record<string, any>; // Stores the original field schema

  @Prop({ type: Object })
  data?: Record<string, any>; // Stores the actual form data (dynamic)

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  createdBy: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  updatedBy: any;
}

export const FormSchema = SchemaFactory.createForClass(Form);
