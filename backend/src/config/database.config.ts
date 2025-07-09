import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class DatabaseConfig {
  @IsString()
  @Env('DATABASE_HOST')
  host: string

  @IsNumber()
  @Env('DATABASE_PORT')
  port: number

  @IsString()
  @Env('DATABASE_NAME')
  databaseName: string

  @IsString()
  @Env('DATABASE_USER')
  databaseUser: string

  @IsString()
  @Env('DATABASE_PASSWORD')
  databasePassword: string

  @IsString()
  @Env('TEST_DATABASE_HOST')
  testHost: string

  @IsNumber()
  @Env('TEST_DATABASE_PORT')
  testPort: number

  @IsString()
  @Env('TEST_DATABASE_NAME')
  testDatabaseName: string

  @IsString()
  @Env('TEST_DATABASE_USER')
  testDatabaseUser: string

  @IsString()
  @Env('TEST_DATABASE_PASSWORD')
  testDatabasePassword: string

  get dbMongo(): string {
    if (this.databaseUser && this.databasePassword) {
      return `mongodb://${this.databaseUser}:${this.databasePassword}@${this.host}:${this.port}`
    } else {
      return `mongodb://${this.host}:${this.port}`
    }
  }
}
