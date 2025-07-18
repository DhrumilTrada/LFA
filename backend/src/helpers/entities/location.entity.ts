import { Prop, Schema } from '@nestjs/mongoose'

@Schema()
export class Location {
  @Prop({ required: true, enum: ['Point'] })
  type: string

  @Prop({ type: [Number], required: true })
  coordinates: number[]
}
