import { action, observable, computed, runInAction } from 'mobx';
import type {AgoraWidgetContext, AgoraWidgetHandle} from 'agora-edu-core'

export class PluginStore {
    context: AgoraWidgetContext
    handle: AgoraWidgetHandle

    constructor(ctx: AgoraWidgetContext, handle: AgoraWidgetHandle) {
        this.context = ctx
        this.handle = handle
    }

    @action
    onReceivedProps(properties:any, cause: any) {
    }
}