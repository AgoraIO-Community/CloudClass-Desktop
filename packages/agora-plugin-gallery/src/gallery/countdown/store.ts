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

    constructor(ctx: AgoraExtAppContext, handle: AgoraExtAppHandle) {
        if(ctx.properties) {
            const {startTime:sStartTime, duration:sDuration} = ctx.properties
            const startTime = parseInt(sStartTime)
            const duration = parseInt(sDuration)
            if(startTime && duration) {
                this.duration = duration
                this.startCountdown(startTime)
            }
        }
        this.context = ctx
        this.handle = handle
    }

    @computed
    get timeText() {
        if(!this.time){
            return `Timer not ticking `
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

    onClick = async () => {
        await this.handle.updateRoomProperty({"startTime": `${this.currentTs()}`, "duration": `${100}`}, {})
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
        const {startTime:sStartTime, duration:sDuration} = properties
        const startTime = parseInt(sStartTime)
        const duration = parseInt(sDuration)
        this.duration = duration
        this.startCountdown(startTime)
    }
}