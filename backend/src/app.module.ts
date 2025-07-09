import { MailConfig } from './config/mail.config'
import { Module } from '@nestjs/common'
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from './config-module/config.module'
import { AppConfig } from './config/app.config'
import { DatabaseConfig } from './config/database.config'
import { AuthJwtConfig } from './config/auth-jwt.config'
import { LoggingConfig } from './config/logging.config'
import { SwaggerConfig } from './config/swagger.config'
import { WebsiteConfig } from './config/website.config'
import { Connection } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { AppConstants } from './helpers/constants/app-constants'
import { mongooseSchemaTransform } from './helpers/schema-transform/mongoose-schema-transform-plugin'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './user/user.module'
// import { LogLevel } from '@sentry/types'
import { LoggerModule } from 'nestjs-pino'
const pino = require('pino')
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MailsModule } from './mails/mails.module'
import { BullModule } from '@nestjs/bull'
import { BullConfig } from './config/bull.config'
import { BullConfigModule } from './bull/bull-config.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'
import { CustomCacheModule } from './cache/cache.module'

@Module({
  imports: [
    ConfigModule.register({
      configs: [
        DatabaseConfig,
        AppConfig,
        AuthJwtConfig,
        LoggingConfig,
        SwaggerConfig,
        WebsiteConfig,
        BullConfig,
        MailConfig
      ]
    }),

    MongooseModule.forRootAsync({
      inject: [DatabaseConfig],
      useFactory: async (databaseConfig: DatabaseConfig) => ({
        uri: databaseConfig.dbMongo,
        dbName: databaseConfig.databaseName,

        // transform mongoose schema
        //remove '_id' and '__v' and add virtual key 'id'
        connectionFactory(connection, name) {
          mongoosePaginate.paginate.options =
            AppConstants.DEFAULT_PAGINATION_OPTIONS

          connection.plugin(mongooseSchemaTransform)
          return connection
        }
      })
    }),

    //pino module for logging
    LoggerModule.forRootAsync({
      inject: [LoggingConfig],
      useFactory: (loggingConfig: LoggingConfig) => {
        const streams: any = []

        if (loggingConfig.logToFile) {
          const options = {
            filename: loggingConfig.fileName,
            frequency: loggingConfig.fileFrequency,
            size: loggingConfig.fileSize,
            verbose: true,
            date_format: loggingConfig.fileDateFormat,
            max_logs: loggingConfig.fileMaxLogsTime,
            audit_hash_type: 'sha256',
            end_stream: true
          }

          if (loggingConfig.fileExtension) {
            options['extension'] = loggingConfig.fileExtension
          }

           
          const rotatingLogStream = require('file-stream-rotator').getStream(
            options
          )

          streams.push({ stream: rotatingLogStream })
        }

        if (loggingConfig.logToConsole) {
          // add pretty print remove pid and hostname and formate timestamp
           
          const pinoDebugPrettyStream = require('pino-pretty')({
            ignore: 'pid,hostname',
            translateTime: 'yyyy-mm-dd HH:MM:ss.l o'
          })
          streams.push({ stream: pinoDebugPrettyStream })
        }

        return {
          pinoHttp: {
            useLevel: 'trace',
            //transport to file
            stream: pino.multistream(streams),
            //remove headers from request object
            serializers: {
              req: (r) => {
                delete r.headers
                delete r.remoteAddress
                delete r.remotePort
                return r
              }
            }
          }
        }
      }
    }),

    //Mail module
    MailerModule.forRootAsync({
      inject: [MailConfig],
      useFactory: (mailConfig: MailConfig) => ({
        transport: {
          host: mailConfig.mailHost,
          port: mailConfig.mailPort,
          ignoreTLS: mailConfig.mailIgnoreTLS,
          secure: mailConfig.mailSecure,
          auth: {
            user: mailConfig.mailUserName,
            pass: mailConfig.mailPassword
          }
        },
        // transport: 'smtps://user@domain.com:pass@smtp.domain.com',
        defaults: {
          from: mailConfig.fromEmail
        },
        preview: true,
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    }),

    //Bull module
    BullModule.forRootAsync({
      inject: [BullConfig],
      useFactory: (bullConfig: BullConfig) => ({
        redis: {
          host: bullConfig.bullHost,
          port: bullConfig.bullRedisPort,
          maxRetriesPerRequest: null
        }
      })
    }),

    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.TIME_TO_LIVE),
        limit: Number(process.env.API_RATE_LIMIT)
      }
    ]),

    BullConfigModule,
    AuthModule,
    UsersModule,
    MailsModule,
    ...(process.env.CACHE_ENABLED === 'true' ? [
      CacheModule.registerAsync({
        useFactory: async () => {
          return {
            stores: [createKeyv('redis://localhost:6379/1')]
          }
        },
        isGlobal: true
      }),
      CustomCacheModule
    ] : [])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
