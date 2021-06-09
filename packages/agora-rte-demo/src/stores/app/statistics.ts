import { t } from "@/i18n";
import { AppStore, UIStore } from "@/stores/app/index";
import { get } from "lodash";
import { computed, observable } from "mobx";

interface CacheInfo {
    progress: number,
    downloading: boolean,
    cached: boolean,
    controller?: any,
    skip: boolean
  }

export class StatisticsStore {

    @observable
    cacheMap = new Map<string, CacheInfo>()

    @observable
    ready: boolean = false

    appStore!: AppStore

    constructor(context: any) {
        this.appStore = context
    }

    @computed
    get loadingStatus() {
        if (!this.appStore.boardStore.ready) {
        return {
            type: 'preparing',
            text: t("whiteboard.loading")
        }
        }

        let currentTaskUuid = this.appStore.boardStore.currentTaskUuid
        if (currentTaskUuid) {
        const cacheInfo = this.cacheMap.get(currentTaskUuid)
        if (cacheInfo && cacheInfo.skip !== true && cacheInfo.downloading && (!cacheInfo.cached || cacheInfo.progress !== 100)) {
            let progress = get(cacheInfo, 'progress', 0)
            console.log(progress)
            return {
            type: 'downloading',
            text: t("whiteboard.downloading", {reason: progress})
            }
        }
        }

        return ''
    }

}