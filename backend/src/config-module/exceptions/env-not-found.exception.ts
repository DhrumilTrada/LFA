export class EnvNotFound extends Error {
  constructor(name: Array<string>) {
    super(`Missing variables in the '.env' file: ` + name.sort().join(', '))
  }
}
