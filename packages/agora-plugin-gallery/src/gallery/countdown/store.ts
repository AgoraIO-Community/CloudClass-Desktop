import { action, observable, computed, runInAction } from 'mobx';
import type {AgoraExtAppContext, AgoraExtAppHandle} from 'agora-edu-core'
export class PluginStore {
    context: AgoraExtAppContext
    handle: AgoraExtAppHandle

    @observable
    result?: number = 0
    @observable
    number?: number = 60
    @observable
    showSetting?: boolean = true
    @observable
    play?: boolean = true

    constructor(ctx: AgoraExtAppContext, handle: AgoraExtAppHandle) {
        if(ctx.properties) {
            const {startTime:sStartTime, duration:sDuration} = ctx.properties
            const startTime = parseInt(sStartTime) * 1000
            const duration = parseInt(sDuration) * 1000
            if(startTime && duration) {
                this.setPlay(true)
                this.setResult(startTime + duration)
                this.setShowSetting(false)
            }
        }
        this.context = ctx
        this.handle = handle
    }

    changeRoomProperties = async ({
        state,
        startTime,
        pauseTime,
        duration,
        commonState,
    }: {
        state?: string,
        startTime?: string,
        pauseTime?: string,
        duration?: string,
        commonState?: number
    }) => {
        const roomProperties: any = this.context.properties || {}
        const commonProperties: any = {}
        commonState !== undefined && (commonProperties['state'] =  commonState) // commonState开启关闭定时器
        state && (roomProperties['state'] =  `${state}`)
        startTime && (roomProperties['startTime'] =  `${startTime}`)
        pauseTime && (roomProperties['pauseTime'] =  `${pauseTime}`)
        duration && (roomProperties['duration'] =  `${duration}`)
        if (commonState === 0) {
            // 定时器关闭，全改为0
            roomProperties['state'] =  `0`
            roomProperties['startTime'] =  `0`
            roomProperties['pauseTime'] =  `0`
            roomProperties['duration'] =  `0`
        }
        await this.handle.updateRoomProperty(roomProperties, commonProperties, {})
    }


    @action
    onReceivedProps(properties:any, cause: any) {
        const {startTime:sStartTime, duration:sDuration, state, pauseTime:sPauseTime} = properties
        const startTime = parseInt(sStartTime) * 1000
        const pauseTime = parseInt(sPauseTime) * 1000
        const duration = parseInt(sDuration) * 1000
        if (state === '1') {
            this.setResult(startTime + duration)
            this.setPlay(true)
        } else if (state === '2') {
            this.setPlay(false)
            this.setResult(Date.now() + duration - (pauseTime - startTime))
        }
        
    }

    @action
    setResult (result: number) {
        this.result = result
    }
    
    @action
    setNumber (number: number) {
        this.number = number
    }

    @action
    setShowSetting (showSetting: boolean) {
        this.showSetting = showSetting
    }

    @action 
    setPlay (play: boolean) {
        this.play = play
    }
}