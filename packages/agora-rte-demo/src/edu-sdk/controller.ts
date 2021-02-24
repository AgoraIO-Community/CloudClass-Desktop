import { unmountComponentAtNode } from 'react-dom'
import { AgoraEduEvent } from './declare'
import { AppStore } from '@/stores/app'
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
  private dom!: Element
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
  private _store?: T;
  private dom!: Element;
  public callback!: EventCallableFunction
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

  get store() {
    return this._store as T
  }

  create(store: T, component: ReactElement, dom: Element, callback: EventCallableFunction) {
    this._store = store
    this.dom = dom
    this.callback = callback
    render(component, this.dom)
    this._state = EduSDKInternalStateEnum.Initialized
    this.callback(AgoraEduEvent.ready)
  }

  async destroy() {
    await this.store.destroy()
    unmountComponentAtNode(this.dom)
    this._state = EduSDKInternalStateEnum.Destroyed
    this._store = undefined
    this.callback(AgoraEduEvent.destroyed)
  }
}

export class MainController {
  
  constructor(
    public readonly appController = new EduSDKController(),
    public readonly replayController = new EduSDKController()
  ) {
  }

  createAppStore(store: AppStore, component: ReactElement, dom: Element, callback: EventCallableFunction) {
    this.appController.create(store, component, dom, callback)
  }

  getAppClassRoom() {
    return this.appController.getClassRoom()
  }
}

export const controller = new MainController()