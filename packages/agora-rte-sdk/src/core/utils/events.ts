export class AGEventEmitter {
  // @internal
  private readonly _eventMap: Map<string, CallableFunction[]> = new Map();

  once(evt: string, cb: CallableFunction) {
    const wrapper = (...args: any[]) => {
      this.off(evt, wrapper);
      cb(...args);
    };
    this.on(evt, wrapper);
    return this;
  }

  on(evt: string, cb: CallableFunction) {
    const cbs = this._eventMap.get(evt) ?? [];
    cbs.push(cb);
    this._eventMap.set(evt, cbs);
    return this;
  }

  off(evt: string, cb: CallableFunction) {
    const cbs = this._eventMap.get(evt);
    if (cbs) {
      this._eventMap.set(
        evt,
        cbs.filter((it) => it !== cb),
      );
    }
    return this;
  }

  removeAllEventListeners(): void {
    this._eventMap.clear();
  }

  emit(evt: string, ...args: any[]) {
    const cbs = this._eventMap.get(evt) ?? [];
    for (let cb of cbs) {
      try {
        cb && cb(...args);
      } catch (e) {
        //cb exception should not affect other callbacks
        let error = e as Error;
        let details = error.stack || error.message;
        console.error(`[event] handling event ${evt} fail: ${details}`);
      }
    }
    return this;
  }
}
