export enum APaaSInternalState {
  Idle = 'Idle',
  Created = 'Created',
  Destroyed = 'Destroyed',
}

/**
 * 抽象类：APaaSLifeCycle
 * 功能：用于描述生命周期aPaaS声明周期
 */
export abstract class APaaSLifeCycle {
  /**
   * @internal
   */
  protected _lifeCycleState: APaaSInternalState = APaaSInternalState.Idle;

  /**
   * 状态
   */
  protected getLifeCycleState() {
    return this._lifeCycleState;
  }

  /**
   * 更新状态
   * @param newState
   */
  protected updateLifeCycleState(newState: APaaSInternalState) {
    this._lifeCycleState = newState;
  }

  constructor() {}
}
