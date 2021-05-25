import { action, observable, computed, runInAction } from 'mobx';
import type {AgoraExtAppContext, AgoraExtAppHandle} from 'agora-edu-core'

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration)

export class PluginStore {
    context: AgoraExtAppContext
    handle: AgoraExtAppHandle
    timer: any
    ticking: boolean = false


    @observable
    time?: number

    duration?: number
    startTime?: number

    @observable
    result?: number = 0
    @observable
    number?: number = 60
    @observable
    showSetting?: boolean = true

    constructor(ctx: AgoraExtAppContext, handle: AgoraExtAppHandle) {
        if(ctx.properties) {
            const {startTime:sStartTime, duration:sDuration} = ctx.properties
            const startTime = parseInt(sStartTime) * 1000
            const duration = parseInt(sDuration) * 1000
            if(startTime && duration) {
                this.duration = duration
                this.startCountdown(startTime)
                this.setResult(startTime + duration)
                this.setShowSetting(false)
            }
        }
        this.context = ctx
        this.handle = handle
    }

    @computed
    get timeText() {
        if(!this.time){
            return `Timer not ticking test`
        }
        if(!this.duration || !this.startTime) {
            return `Countdown not started `
        }
        let dDuration = dayjs.duration(this.time - this.startTime)
        console.log(dDuration.seconds())
        return `${this.duration - (this.time - this.startTime)}`
    }

    countReachZero(time:number) {
        if(time && this.startTime && this.duration) {
            if((time - this.startTime) >= this.duration) {
                // stop count when reach 0
                return true
            }
        }
        return false
    }

    currentTs() {
        return Math.floor(dayjs().valueOf() / 1000)
    }

    @action
    tick() {
        // update time
        this.time = this.currentTs()
        console.log(this.time)
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            runInAction(() => {
                if(this.time && this.countReachZero(this.time)) {
                    this.time = undefined
                    this.ticking = false
                    return
                }
                this.tick()
            })
        }, 1000)
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

    startCountdown = (startTime:number) => {
        this.startTime = startTime

        if(this.countReachZero(this.currentTs())) {
            return
        }

        if(this.ticking) {
            return
        }
        this.ticking = true
        this.tick()
    }

    cleanup() {
        clearTimeout(this.timer)
        this.time = undefined
        this.startTime = undefined
        this.duration = undefined
    }

    @action
    onReceivedProps(properties:any, cause: any) {
        const {startTime:sStartTime, duration:sDuration, state} = properties
        const startTime = parseInt(sStartTime) * 1000
        const duration = parseInt(sDuration) * 1000
        this.duration = duration
        if (state === '1') {
            this.setResult(startTime + duration)
        } else if (state === '2') {
            this.setResult(0)
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
}