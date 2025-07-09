<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Login API

- Login api check user has tokens array or not. If not token array then generate new token array
- Generate a opaque type refresh token and create token object and check the max session size. If max session size exist then remove oldest session and store new session in database
- Using refresh token id, user role and user id generate access token and it gives user object, refresh token and access token

## Logout API

- Using access token find refresh token Id and remove that refresh token associated with that user.

## AUTH/REFRESH API

- This api takes access token in header and refresh token in body.
- Take a access token without checking expire time
- First check diff between current time and given access token expire time in milliSeconds.
- If the difference between the access token expire time and current time is grater than allowed inactivity time, then throw an error.
- Else generate new access token using refresh token Id and change that refresh token's lastTokenIssuedAt date using that refresh token.
- Give a new access token to renew the session.

## CRON to remove expire token

- Remove all the refresh tokens which have not issued any access tokens in the inactivity time
- Every hour this cron will run

## Redis Integration with Bull Queue
- Set the **BULL_REDIS_HOST**, **BULL_REDIS_PORT** in environment file for sending mail in queue

- We utilize **Redis** for data persistence in conjunction with **Bull**, a robust queue management package for **NestJS**. Bull internally leverages Redis to store and manage job data efficiently.

### Key Features:
- **Bull** registers and manages queues, persisting job-related data in Redis.
- You can define and manage multiple queues for various use cases.

By combining **Bull** and **Redis**, we achieve scalable and reliable queue-based processing.


## FOR Email send setup

- Set the **MAIL_FROM_EMAIL**, **MAIL_SMTP_USERNAME**, **MAIL_SMTP_PASSWORD**, **MAIL_SMTP_HOST**, and **MAIL_SMTP_PORT**, **MAIL_SMTP_IGNORETLS**, **MAIL_SMTP_SECURE** in the environment file for sending emails.

- We are using the `nestjs-modules/mailer` package for email functionality in NestJS.

- Email configuration has been added in the `AppModule` using the SMTP transport protocol.

- Emails are sent via a queue, so the `QueueModule` is imported to handle email requests in the queue

## API Documentation

This project uses Swagger for API documentation. Swagger provides a user-friendly UI to explore and test the API endpoints.

To access the Swagger UI, run the project and navigate to:  
`http://localhost:3005/api` (or your configured path).

### Add Operation

**Endpoint**: `POST /api/resource`  
**Description**: Adds a new resource to the system.

#### Request Body
The request body should be a JSON object with the following structure:

| Field         | Type       | Description                        | Required |
|---------------|------------|------------------------------------|----------|
| `name`        | `string`   | Name of the resource               | Yes      |
| `description` | `string`   | Description of the resource        | No       |
| `quantity`    | `number`   | Quantity of the resource           | Yes      |
| `price`       | `number`   | Price of the resource              | No       |

Example:

```json
{
  "name": "Sample Resource",
  "description": "A sample resource for demonstration",
  "quantity": 10,
  "price": 100.5
}
```

## Logger Support for Logs

This project includes a robust logging system to capture and manage logs efficiently. The logger helps in debugging, monitoring, and analyzing the application behavior.

### Key Features
- **Log Levels**: Supports different log levels such as `info`, `debug`, `warn`, `error`, etc.
- **Structured Logging**: Provides clear and structured log messages for better readability.
- **Customizable**: Can be extended or customized based on specific requirements.
- **Transport Options**: Supports console logging and integration with external log management systems.

### Usage
The logger is integrated throughout the application and can be used in services, controllers.

Example:
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('MyService');

this.logger.log('This is an info message');    // Default log level
this.logger.error('This is an error message'); // Error log
this.logger.warn('This is a warning message'); // Warning log
this.logger.debug('This is a debug message');  // Debug log
```
