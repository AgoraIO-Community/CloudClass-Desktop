import { action, computed, observable } from 'mobx';

export class HistoryStore {
  @observable
  private _stack: string[] = [];

  @computed
  get length() {
    return this._stack.length;
  }

  @action.bound
  push(pathname: string) {
    this._stack.push(pathname);
  }

  @action.bound
  pop() {
    return this._stack.pop();
  }

  @action.bound
  replace(pathname: string) {
    const { length } = this._stack;
    if (length > 0) {
      this._stack[length - 1] = pathname;
      return;
    }
    this._stack[0] = pathname;
  }
}

export const historyStore = new HistoryStore();
