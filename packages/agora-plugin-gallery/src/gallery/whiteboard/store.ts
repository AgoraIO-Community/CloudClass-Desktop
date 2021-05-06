import { action, observable, computed, runInAction } from 'mobx';
import type {AgoraExtAppContext, AgoraExtAppHandle} from 'agora-edu-core'

export class PluginStore {
    context: AgoraExtAppContext
    handle: AgoraExtAppHandle

    constructor(ctx: AgoraExtAppContext, handle: AgoraExtAppHandle) {
        this.context = ctx
        this.handle = handle
    }

    @action
    onReceivedProps(properties:any, cause: any) {
    }
}