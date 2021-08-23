import { action, observable } from "mobx";
import { IAgoraWidget } from "../api/declare";
import { BizLogger } from "../utilities/kit";

export class WidgetStore {
    widgets: {[key:string]: IAgoraWidget} = {}

    @observable
    activePluginId?: string

    @action.bound
    activePlugin(appId: string) {
        this.activePluginId = appId
    }

    leave() {
        let keys = Object.keys(this.widgets)
        for(let i = 0; i < keys.length; i++) {
            try {
                this.widgets[keys[i]].widgetWillUnload()
            } catch(e) {
                BizLogger.warn(`[Widget][${keys[i]}] widget unload failed`)
            }
        }
    }
}