import { t } from "@/i18n";
import { AppStore, UIStore } from "@/stores/app/index";
import { get } from "lodash";
import { computed, observable } from "mobx";
import { EduClassroomStateEnum } from "./scene";

interface CacheInfo {
    progress: number,
    downloading: boolean,
    cached: boolean,
    controller?: any,
    skip: boolean
  }



export enum TimeFormatType {
Timeboard,
Message
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
            // console.log(progress)
            return {
            type: 'downloading',
            text: t("whiteboard.downloading", {reason: progress})
            }
        }
        }

        return ''
    }


    @computed
    get classTimeText() {
        let timeText = ""
        const duration = this.appStore.acadsocStore.classTimeDuration
        const placeholder = `-- ${t('nav.short.minutes')} -- ${t('nav.short.seconds')}`

        // duration is always >= 0, if it's smaller than 0, display placeholder
        if(duration < 0) {
        timeText = `${t('nav.to_start_in')}${placeholder}`
        return timeText
        }

        switch(this.appStore.sceneStore.classState){
        case EduClassroomStateEnum.beforeStart: 
            timeText = `${t('nav.to_start_in')}${this.appStore.acadsocStore.formatTimeCountdown(duration, TimeFormatType.Timeboard)}`
            break;
        case EduClassroomStateEnum.start:
        case EduClassroomStateEnum.end:
            timeText = `${t('nav.started_elapse')}${this.appStore.acadsocStore.formatTimeCountdown(duration, TimeFormatType.Timeboard)}`
            break;
        }
        // console.log(timeText)
        return timeText
    }

}