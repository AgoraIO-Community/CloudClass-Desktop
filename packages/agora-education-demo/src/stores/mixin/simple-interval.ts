export class SimpleInterval {
  _intervalMap: Record<string, any> = {}

  addInterval(key: string, callback: CallableFunction, delay: number) {
    if (this._intervalMap.hasOwnProperty(key)) {
      this.delInterval(key)
    }
    this._intervalMap[key] = setInterval(callback, delay)
  }

  delInterval(key: string) {
    clearInterval(this._intervalMap[key])
    delete this._intervalMap[key]
  }
}