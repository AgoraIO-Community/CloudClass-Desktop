export type UserSchema = {
  name: string
  userUuid: string
  reward: number
}

export const GenValidator = (payload: any, rules: string[]) => {
  // const userModel = new UserModel(payload)

  // if (rules[0].name.isRequired) {

  // }

  // const errors = []

  // if (!userModel.name) {
  //   // throw ''
  //   errors.push(`name is required`)
  // }

  // if (!userModel.userUuid) {
  //   errors.push(`userUuid is required`)
  // }

  // if (!userModel.reward) {
  //   errors.push(`reward is required`)
  // }

  // if (errors.length) {
  //   throw new Error(`${errors.join('\n')}`)
  // }
}

export class UserModel {

  _name!: string
  _userUuid!: string
  _reward!: number

  _sequence?: number

  constructor(schema: UserSchema) {
    this.updateAttributes(schema)
  }

  updateAttributes(schema: UserSchema) {
    this._name = schema.name
    this._userUuid = schema.userUuid
    this._reward = schema.reward
  }

  get name() {
    return this._name
  }

  get userUuid() {
    return this._userUuid
  }

  get reward() {
    return this._reward
  }

  set sequence(val: number) {
    this._sequence = val
  }

  get sequence(): number {
    return this._sequence as number
  }

  set name(val: string) {
    this._name
  }

  set uuid(val: string) {
    this._userUuid = val
  }

  set reward(val: number) {
    this._reward = val
  }
}