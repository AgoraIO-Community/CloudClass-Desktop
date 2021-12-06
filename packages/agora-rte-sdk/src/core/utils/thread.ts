import { Injectable } from '../decorator/type';
import { AGEventEmitter } from './events';
export class AgoraRteThread extends AGEventEmitter {
  protected logger!: Injectable.Logger;
  protected running: boolean = false;
  runnable: boolean = true;

  run() {
    if (this.running || !this.runnable) {
      return;
    }

    this.running = true;

    const timer = setTimeout(async () => {
      clearTimeout(timer);
      await this.onExecution();
      this.running = false;
    }, 0);
  }

  async onExecution() {}

  stop() {
    this.running = false;
  }
}
