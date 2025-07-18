# ConfigModule

- get a variable from env decorator
- push into registreEnvVariable array
- make a unique set of array
- get a value from process.env and define the type
- if the value is not preset set the default value
- config module inject with default global options
- config module check the value is missing in .env file and used in config file and give an exception if value is not in .env
- validate that value with class validation and if there an errors, throw an exception
- If not an errors give the value of variables

### How to use?

```
- create a config file for the .env variables
- used .env decorator to define the .env variable
- import and registered the config module in globally in app.module
- inject module where you want to used and get env varible value

```

### packages to install

```
`npm i --save class-validator class-transformer`
`npm i dotenv`

```
