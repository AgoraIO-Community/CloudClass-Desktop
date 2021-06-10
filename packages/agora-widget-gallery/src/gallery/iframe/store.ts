import { action, observable, computed, runInAction, autorun } from 'mobx';
import type {AgoraWidgetContext} from 'agora-edu-core'

export class PluginStore {
    context: AgoraWidgetContext
    props: any

    constructor(ctx: AgoraWidgetContext, props: any) {
        this.context = ctx
        this.props = props
    }

    @action
    onReceivedProps(properties:any, cause: any) {
    }
}