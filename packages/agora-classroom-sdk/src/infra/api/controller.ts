import { unmountComponentAtNode } from 'react-dom'
import { AgoraEduEvent } from './declare'
import { render } from 'react-dom'
import { ReactElement } from 'react'

export enum EduSDKInternalStateEnum {
  Created = "created",
  Initialized = "initialized",
  Destroyed = "destroyed"
}

export type EventCallableFunction = (evt: AgoraEduEvent) => any

export abstract class ClassRoomAbstractStore {

  constructor() {

  }

  destroy!: () => Promise<any>;
}

export class ClassRoom<T extends ClassRoomAbstractStore> {

  private readonly store!: T
  private dom!: HTMLElement
  private readonly controller: EduSDKController<T>

  constructor(context: EduSDKController<T>) {
    this.controller = context
  }

  async destroy () {
    await this.controller.destroy()
  }
}

export class EduSDKController<T extends ClassRoomAbstractStore> {

  private room!: ClassRoom<T>;
  private dom!: HTMLElement;
  public callback!: EventCallableFunction
  public _storeDestroy!: CallableFunction
  private _state: EduSDKInternalStateEnum = EduSDKInternalStateEnum.Created

  private _lock: boolean = false

  constructor(
  ) {
    this.room = new ClassRoom(this)
  }

  get hasCalled() {
    if (this._lock || this.isInitialized) {
      return true
    }
    return false
  }

  get lock(): boolean {
    return this._lock
  }

  acquireLock() {
    this._lock = true
    return () => {
      this._lock = false
    }
  }
  
  get isInitialized(): boolean {
    return this.state === EduSDKInternalStateEnum.Initialized
  }

  getClassRoom() {
    return this.room
  }

  get state() {
    return this._state
  }

  create(component: ReactElement, dom: HTMLElement, callback: EventCallableFunction) {
    this.dom = dom
    this.callback = callback
    render(component, this.dom)
    this._state = EduSDKInternalStateEnum.Initialized
    this.callback(AgoraEduEvent.ready)
  }


  bindStoreDestroy(destroy: CallableFunction) {
    this._storeDestroy = destroy
  }

  async destroy() {
    if (this._storeDestroy) {
      await this._storeDestroy()
    }
    unmountComponentAtNode(this.dom)
    this._state = EduSDKInternalStateEnum.Destroyed
    this.callback(AgoraEduEvent.destroyed)
  }
}

export class MainController {
  
  constructor(
    public readonly appController = new EduSDKController(),
    public readonly replayController = new EduSDKController(),
    public readonly storageController = new EduSDKController()
  ) {
  }


  getAppClassRoom() {
    return this.appController.getClassRoom()
  }
}

export const controller = new MainController()