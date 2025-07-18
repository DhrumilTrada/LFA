# 🧠 NestJS Module Generation Prompt

This prompt is designed for a code-generation AI to scaffold a NestJS-compatible module **exactly** following the structure and conventions of the existing `user` module.

---

## 🔧 Instruction

You are a code-generation AI assistant. Based on the schema I will provide, generate a complete NestJS-compatible TypeScript module. Use the existing `user` module structure in my codebase (provided) as the **exact reference** for folder organization, naming conventions, guards, decorators, DTO usage, filter handling, and selectType logic.

---

## 📁 File Structure (Modeled exactly after user module)

Generate the following files in the same style, structure, and content as used in the `user` module:

1. Schema: `src/{{moduleName}}/schema/{{moduleName}}.schema.ts`
2. DTOs:
   - `src/{{moduleName}}/dto/create-{{moduleName}}.dto.ts`
   - `src/{{moduleName}}/dto/update-{{moduleName}}.dto.ts`
3. Controller: `src/{{moduleName}}/{{moduleName}}.controller.ts`
4. Service: `src/{{moduleName}}/{{moduleName}}.service.ts`
5. Module: `src/{{moduleName}}/{{moduleName}}.module.ts`
6. Constants: `src/{{moduleName}}/constants/{{moduleName}}-type.constant.ts`
7. Filters:
   - `src/{{moduleName}}/filters/{{moduleName}}-select-type.enum.ts`
   - `src/{{moduleName}}/filters/{{moduleName}}.filter.ts`

---

### 1. `schema/[module].schema.ts`
- Use `@Schema`, `Prop` from `@nestjs/mongoose`, and `SchemaFactory`.
- Use `MongooseSchema.Types.ObjectId` where reference is required, and reference the correct model by importing the Schema from mongoose as MongooseSchema.
- Add `@ApiProperty` for each field.
- Add `mongoose-paginate-v2` plugin.
- If an enum is used (e.g., `type: "male" | "female"`), **do not inline the values**—create a corresponding enum object in the constants folder.

---

### 2. `dto/create-[module].dto.ts` and `update-[module].dto.ts`
- Create separate DTOs for create and update operations
- Update DTO should extend PartialType of Create DTO
- Use proper validation decorators (@IsString, @IsOptional, etc.)
- Include @ApiProperty for Swagger documentation
- For nested objects, use @ValidateNested and @Type

---

### 3. `controller/[module].controller.ts`
- Implement CRUD operations (create, findAll, findOne, update, delete)
- Use proper decorators for authentication (@UseGuards)
- Add @ResponseMessage() with appropriate messages
- Use @UserId() and @UserRole() custom decorators where needed
- Implement proper filtering and pagination

---

### 4. `service/[module].service.ts`
- Generate a NestJS filter file named `<entity>.service.ts` modeled like the given `user.service.ts`. This file should:

- Implement `create`, `findAll`, `findOne`, `update`, `delete` methods.
- `create` method should return the result from `findOne` after inserting.
- `findAll` should:
  - Use `paginate()` method like in `user.service.ts`
  - Accept filter object and pagination options.
  - Get `select`, `populate`, `pagination` from `selectType` config.
- `findOne` should also support `selectType` and return according to config.
- Implement `getFilterParams()` method for dynamic filtering. findAll method should use this

---

### 5. `module/[module].module.ts`
- Import required modules (e.g., PlanModule for referenced fields).
- Handle circular dependencies using `forwardRef()`.
- Register schema via `MongooseModule.forFeatureAsync`.
- Add controller, providers, and exports as necessary.

---

### 6. `constants/[module]-type.constant.ts`
- Create enum for fields like `type` (e.g., Male, Female).
- Use this constant in schema and DTOs (do not hardcode values).

---

### 7. `filters/`

#### a. `filters/[module]-select-type.enum.ts`
- Enum like `BASIC`, `DETAIL`, etc.
- Export a `SelectTypeObject` that maps enum values to:
  - `select`: which fields to include
  - `populate`: which fields to populate (support nested levels)
  - `pagination`: whether to apply pagination

#### b. `filters/[module].filter.ts`
- Generate a NestJS filter file named `<entity>.filter.ts` modeled like the given `user.filter.ts`. This file should:

- Import `class-validator`, `class-transformer`, and `@nestjs/swagger`.
- Define a filter DTO class for the `<entity>` (e.g., `UserFilter`) with optional fields using validation decorators.
- Define a `<Entity>PaginationQuery` class that:
  - Extends `PaginationQuery` (assume it's imported from a common helper).
  - Implements a method `getPaginationOptions()` that merges default pagination with a select type config.
- The exact structure of the <Entity>SelectTypeQuery class Complete example code showing how the class should be implemented
- include a `[module]SelectTypeQuery` class with a  selectType `<entity>` and getOptions method to return selection options.
- Ensure it follows the same structure as in the `user.filter.ts` example.

---

## 🔄 Integration and Behavior

- Reference your filter class in the controller.
- Use custom decorators like `@UserId`, `@UserRole`, `@ResponseMessage`.
- Permissions and guards must reflect the style in the `user` module.
- Follow repository pattern and keep response shaping clean and consistent.

---

## 📘 Schema Used

```json
[
  { "fieldName": "uid", "type": "string", "required": true, "description": "Unique identifier", "example": "abc-123" },
  { "fieldName": "name", "type": "string", "required": true, "description": "User's full name", "example": "John Doe" },
  { "fieldName": "email", "type": "string", "required": true, "description": "Email address" },
  { "fieldName": "phone", "type": "string", "required": false, "description": "Phone number" },
  { "fieldName": "type", "type": "string", "required": true, "enum": ["male", "female"], "description": "Gender type" },
  {
    "fieldName": "address", "type": "object", "required": false, "description": "Address details",
    "properties": [
      { "fieldName": "street", "type": "string", "required": true },
      { "fieldName": "city", "type": "string", "required": true },
      { "fieldName": "state", "type": "string", "required": true },
      { "fieldName": "zipCode", "type": "string", "required": true }
    ]
  },
  { "fieldName": "plans", "type": "Types.ObjectId", "ref": "Plan", "required": false, "description": "Plan reference" },
  { "fieldName": "createdAt", "type": "date", "required": true, "description": "Creation date" },
  { "fieldName": "isActive", "type": "boolean", "required": false, "description": "Active status" }
]

module name is "agency"
