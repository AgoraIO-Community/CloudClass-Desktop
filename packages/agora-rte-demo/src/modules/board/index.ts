export class WhiteBoardManager<T> {
  nativeView?: HTMLElement
  readonly board!: T

  constructor(
    board: T
  ) {
    this.board = board
  }

  mount(nativeView?: HTMLElement) {
    this.nativeView = nativeView
  }

  async join() {
    throw new Error('Not Implemented')
  }

  async grantPermission(): Promise<boolean> {
    throw new Error('Not Implemented')
  }

  async revokePermission(): Promise<boolean> {
    throw new Error('Not Implemented')
  }

  async leave() {
    throw new Error('Not Implemented')
  }
}