export class EnvValidationFailed extends Error {
  constructor(name: string[][]) {
    console.error('Errors validating Configs:')
    name.forEach((it) => {
      it.forEach((it2) => {
        console.error(it2)
      })
    })
    super(`Error validating Env Configs`)
  }
}
