export class GenericErrorWrapper extends Error {

  stack?: string
  code?: number = Number.MIN_VALUE

  constructor(err: any) {
    super(err)
    if (err instanceof String) {
      this.message = `${err}`
    } else {
      if (err.hasOwnProperty('stack')) {
        this.stack = err.stack
      }
      if (err.hasOwnProperty('message')) {
        this.message = err.message
      }
      if (err.hasOwnProperty('name')) {
        this.name = err.name
      }
      if (err.hasOwnProperty('code')) {
        this.code = err.code
      }
    }
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === "string") {
      return `GenericError: ${JSON.stringify({
        name: this.name,
        code: this.code,
        message: this.message,
        stack: this.stack
      })}`
    }
  }
}