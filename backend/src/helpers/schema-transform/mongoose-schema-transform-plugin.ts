import { Schema } from 'mongoose'
//REF: https://medium.com/@zhiguang.chen/mongoose-how-to-make-the-global-schema-settings-working-with-the-local-settings-c48bcc90292e

export const mongooseSchemaTransform = (schema: Schema) => {
  // Clone the setting from schemas
  const settings = { ...schema.get('toJSON') }
  // Abstract transform function
  const transform = settings.transform
  delete settings.transform
  schema.set('toJSON', {
    // It will be overridden
    virtuals: true,
    transform: (document, returnedObject, options) => {
      delete returnedObject._id
      delete returnedObject.__v
      //Execute the transform function from schemas such as memberSchema
      if (transform && typeof transform != 'boolean') {
        transform(document, returnedObject, options)
      }
    },
    // Attach the other settings, such as virtuals:true from memberSchema in this example.
    ...settings
  })
}
