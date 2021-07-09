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
        canChange,
        mulChoice,
        startTime,
        title,
        items,
        answer,
        reply
    }: {
        state?: string,//config(老师本地配置),start(开始答题/投票),end(答题/投票结束)
        canChange?: boolean,//是否允许修改(投票为false，答题为true)
        mulChoice?: boolean,//是否多选(答题为true，投票可设置)
        startTime?: string,
        title?:string,
        items?: Array<string>,//可选内容
        answer?: Array<string>,//正确答案(答题用，投票忽略)
        reply?: Array<{
            uuid: string,//学生id
            replyTime: string, //回复时间
            answer: Array<string>//回复答案
        }>//学生回复
    }) => {

    }


    @action
    onReceivedProps(properties:any, cause: any) {
        
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