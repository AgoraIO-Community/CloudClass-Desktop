import { action, observable, computed, runInAction } from 'mobx';
import type { AgoraExtAppContext, AgoraExtAppHandle } from 'agora-edu-core'
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { Toast, transI18n } from '~ui-kit'
import { threadId } from 'worker_threads';

const formatTime = (long: number) => {
    let h: any = Math.floor(long / (60 * 60));
    h = (h < 10 ? '0' : '') + h
    let m: any = Math.floor(long / 60) % 60;
    m = (m < 10 ? '0' : '') + m
    let s: any = Math.floor(long % 60);
    s = (s < 10 ? '0' : '') + s
    return h + ':' + m + ':' + s;
}

export class PluginStore {
    context: AgoraExtAppContext
    handle: AgoraExtAppHandle

    @observable
    height?: number = 310
    @observable
    title?: string = ''
    @observable
    answer?: string[] = ['', '']
    @observable
    selAnswer?: string[] = []
    @observable
    currentTime?: string = ''
    @observable
    students?: any[]
    @observable
    status: string = 'config'//config,answer,info,end
    @observable
    answerInfo?: string[] = []
    @observable
    buttonName?: string = 'vote.start'
    @observable
    ui?: string[] = ['sels']//'sels','users','infos','subs'
    @observable
    timehandle?: any = null
    @observable
    mulChoice?: boolean = false

    constructor(ctx: AgoraExtAppContext, handle: AgoraExtAppHandle) {
        this.context = ctx
        this.handle = handle
        this.onReceivedProps(ctx.properties || {}, null)
    }

    @action
    updateTime = () => {
        if (this.status === 'config') {
            this.currentTime = ''
        } else {
            let properties = this.context.properties
            this.currentTime = formatTime(properties.endTime ? Number(properties.endTime) - Number(properties.startTime) : Math.floor(Date.now() / 1000) - Number(properties.startTime))
        }

        if (this.status === 'config' || this.status === 'end' || this.context.properties.endTime) {
            this.timehandle && clearInterval(this.timehandle);
            this.timehandle = null
        } else {
            this.timehandle || (this.timehandle = setInterval(() => {
                this.updateTime()
            }, 1000))
        }
    }

    changeRoomProperties = async ({
        state,
        canChange = false,
        mulChoice,
        startTime,
        endTime,
        title,
        items,
        answer,
        replyTime,
        commonState
    }: {
        state?: string,//config(老师本地配置),start(开始答题/投票),end(答题/投票结束)
        canChange?: boolean,//是否允许修改(投票为false，答题为true)
        mulChoice?: boolean,//是否多选(答题为true，投票可设置)
        startTime?: string,
        endTime?: string,
        title?: string,
        items?: Array<string>,//可选内容
        answer?: Array<string>,//正确答案(答题用，投票忽略)
        replyTime?: string,
        commonState?: number
    }) => {
        let roomProperties: any = {}
        if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
            state && (roomProperties['state'] = state)
            canChange && (roomProperties['canChange'] = canChange)
            typeof mulChoice !== 'undefined' && (roomProperties['mulChoice'] = mulChoice)
            startTime && (roomProperties['startTime'] = startTime)
            endTime && (roomProperties['endTime'] = endTime)
            items && (roomProperties['items'] = items)
            title && (roomProperties['title'] = title)
            answer && (roomProperties['answer'] = answer)
            if (state === "start") {
                roomProperties['students'] = []
                roomProperties['studentNames'] = []
                this.context.userList?.map((user: any) => {
                    if (!(/^guest[0-9]{10}2$/).test(user.uid || '')) {
                        roomProperties['students'].push(user.uid)
                        roomProperties['studentNames'].push(user.name)
                    }
                });
            } else if (state === "clear") {
                roomProperties['students'] = []
                roomProperties['studentNames'] = []
                roomProperties['state'] = 0
                roomProperties['canChange'] = false
                roomProperties['mulChoice'] = false
                roomProperties['startTime'] = 0
                roomProperties['endTime'] = 0
                roomProperties['title'] = ''
                roomProperties['items'] = []
                roomProperties['answer'] = []
                let propers: string[] = [];
                this.context.properties.students && this.context.properties.students.map((ele: string) => {
                    propers.push('student' + ele)
                })
                console.log('clear:',this.context.properties.students,propers,this.context.properties);
                
                await this.handle.deleteRoomProperties(propers, {})
            }
            await this.handle.updateRoomProperty(roomProperties, { state: commonState || 0 }, {})
        } else {
            if (this.context.properties.state === "start") {
                roomProperties['student' + this.context.localUserInfo.userUuid] = { replyTime, answer }
                await this.handle.updateRoomProperty(roomProperties, { state: commonState || 0 }, {});
            }
        }
    }

    onSubClick = (clear: boolean = false) => {
        if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
            if (clear) {
                this.changeRoomProperties({ state: 'clear' })
            } else {
                if (this.status === 'config') {
                    let sels: string[] = [];
                    this.selAnswer?.map((sel: string) => {
                        if (this.answer?.includes(sel)) {
                            sels.push(sel)
                        }
                    })
                    this.changeRoomProperties({ state: 'start', startTime: (Math.floor(Date.now() / 1000)).toString(), title: this.title, items: this.answer, mulChoice: this.mulChoice, answer: sels, commonState: 1 })
                } else if (this.status === 'info') {
                    this.changeRoomProperties({ state: 'end', endTime: (Math.floor(Date.now() / 1000)).toString(), commonState: 1 })
                } else {
                    this.changeRoomProperties({ state: 'clear' })
                }
            }
        } else {
            if (this.status === 'answer') {
                this.changeRoomProperties({ replyTime: (Math.floor(Date.now() / 1000)).toString(), answer: this.selAnswer, commonState: 1 })
            }
        }
    }

    @action
    onReceivedProps(properties: any, cause: any) {
        this.context.properties = properties
        if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
            if (properties.state === 'start' || properties.state === 'end') {
                this.title = properties.title
                this.answer = properties.items
                this.mulChoice = properties.mulChoice
                this.selAnswer = []
                this.students = []
                let selNumber = [0,0,0,0,0,0,0,0,0,0];
                properties.students.map((student: string, index: number) => {
                    let answer = properties['student' + student]
                    if (answer && answer.answer) {
                        answer.answer.map((sel:string)=>{
                            let idx = properties.items.indexOf(sel)
                            idx >= 0 && selNumber[idx]++
                        })
                    }
                })
                
                properties.items.map((item:string,index:number)=>{
                    this.answerInfo && (this.answerInfo[index] = `(${selNumber[index]}) ${Math.floor(selNumber[index]*100/(properties.students.length||1))}%`)
                })
                this.status = properties.state === 'end' ? 'end' : 'info'
                this.height = 510 - (7-(this.answer?.length||0))*40 - (properties.state === 'end' ? 70 : 0) - 40
                this.buttonName = properties.state === 'end' ? 'vote.restart' : 'vote.over'
                this.ui = properties.state === 'end' ? ['users', 'infos'] : ['users', 'infos', 'subs']
            } else {
                this.title = ""
                this.answer = ['', '']
                this.selAnswer = []
                this.currentTime = ''
                this.students = []
                this.status = 'config'
                this.height = 310
                this.buttonName = 'vote.start'
                this.ui = ['sels', 'subs']
            }
        } else {
            if (properties.state === 'start' && typeof properties['student' + this.context.localUserInfo.userUuid] === 'undefined') {
                this.title = properties.title
                this.answer = properties.items
                this.mulChoice = properties.mulChoice
                this.status = 'answer'
                this.height = 510 - (7-(this.answer?.length||0))*40 - (properties.state === 'end' ? 70 : 0) - 40
                this.buttonName = typeof properties['student' + this.context.localUserInfo.userUuid] === 'undefined' ? 'vote.submit' : 'vote.change'
                this.ui = ['sels', 'subs']
            } else if (properties.state === 'end' || properties.state === 'start') {
                this.title = properties.title
                this.answer = properties.items
                this.mulChoice = properties.mulChoice
                this.selAnswer = typeof properties['student' + this.context.localUserInfo.userUuid] === 'undefined' ? [] : properties['student' + this.context.localUserInfo.userUuid].answer
                this.status = 'info'
                this.height = 510 - (7-(this.answer?.length||0))*40 - 70 - 40
                this.ui = ['infos']

                let selNumber = [0,0,0,0,0,0,0,0,0,0];
                properties.students.map((student: string, index: number) => {
                    let answer = properties['student' + student]
                    if (answer && answer.answer) {
                        answer.answer.map((sel:string)=>{
                            let idx = properties.items.indexOf(sel)
                            idx >= 0 && selNumber[idx]++
                        })
                    }
                })
                
                properties.items.map((item:string,index:number)=>{
                    this.answerInfo && (this.answerInfo[index] = `(${selNumber[index]}) ${Math.floor(selNumber[index]*100/(properties.students.length||1))}%`)
                })
            } else {
                this.status = 'config'
                this.title = ""
                this.answer = ['', '']
                this.selAnswer = []
                this.currentTime = ''
                this.students = []
                this.height = 270
                this.buttonName = 'vote.submit'
                this.ui = ['infos']
            }
        }
    }

    @action
    addAnswer() {
        if (this.answer && this.answer.length < 8) {
            this.answer.push('')
            this.height = 510 - (7-this.answer.length)*40
        }
    }

    @action
    subAnswer() {
        if (this.answer && this.answer.length > 2) {
            this.answer.splice(this.answer.length - 1, 1)
            this.height = 510 - (7-this.answer.length)*40
        }
    }

    @action
    changeAnswer(idx:number, answer: string) {
        if(this.status === 'config'){
            if (this.answer && this.answer.length > idx && idx >= 0) {
                this.answer[idx] = answer
             }
        }
    }

    @action
    changeSelAnswer(sel: string, mul: boolean = true) {
        if (mul) {
            if (this.selAnswer?.includes(sel)) {
                this.selAnswer.splice(this.selAnswer.indexOf(sel), 1);
            } else {
                this.selAnswer?.push(sel)
            }
        }else{
            this.selAnswer = [sel]
        }
    }
}