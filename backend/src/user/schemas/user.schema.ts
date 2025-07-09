import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'
import { Schema as MongooseSchema } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { Role } from '../../auth/roles/roles'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { AppConstants } from '../../helpers/constants/app-constants'

export type UserDocument = User & Document

@Schema()
export class Token {
  @Prop({ required: true })
  refreshToken: string

  @Prop({ required: true })
  createdAt: Date

  @Prop({ required: true })
  lastTokenIssuedAt: Date

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  userSessionDetails: any
}
export const TokenSchema = SchemaFactory.createForClass(Token)

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @Prop({ required: true })
  phno: number

  @Prop({ select: false })
  password: string

  @Prop({ required: true, enum: Role })
  role: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ required: true, select: false })
  resetPasswordToken: string

  @Prop({ type: [TokenSchema], select: false })
  tokens: Token[]

  // ********* [START] Common Properties *********
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  createdBy: User

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  updatedBy: User

  @Prop({ select: false })
  createdAt: Date

  @Prop({ select: false })
  updatedAt: Date

  // ********* [END] Common Properties *********
}

// Set default options for the Pagination Plugin

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.plugin(paginate)
UserSchema.plugin(aggregatePaginate)

UserSchema.index({ name: 1, email: 1 })