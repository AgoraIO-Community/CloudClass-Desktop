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

const getStudentInfo = (info: any) => {
    if (info === null || typeof info === 'undefined' || info === 'deleted' || JSON.stringify(info) === "{}") {
        return null;
    }
    return info;
}

export const c2h = (count: number)=>{
    if (count > 60) {
      return 120;
    }else if(count > 40){
      return 90
    }
    return 75
  }

export class PluginStore {
    context: AgoraExtAppContext
    handle: AgoraExtAppHandle

    @observable
    height?: number = 283
    @observable
    title?: string = ''//标题
    @observable
    answer?: string[] = ['', '']//投票选项
    @observable
    selAnswer?: string[] = []//投票已选项
    @observable
    currentTime?: string = ''//当前时间
    @observable
    students?: any[]//未使用
    @observable
    status: string = 'config'//当前状态：config(老师设置投票),answer(学生投票),info(投票进行中，老师或学生显示信息),end(投票结束)
    @observable
    answerInfo?: string[] = []//投票结果信息
    @observable
    buttonName?: string = 'vote.start'//按钮文字
    @observable
    ui?: string[] = ['sels']//界面显示配置：'sels'(无意义),'users'(无意义),'infos'(无意义),'subs'(底部按钮)
    @observable
    timehandle?: any = null//保存时间刷新函数的句柄
    @observable
    mulChoice?: boolean = false
    @observable
    globalContext: any = {}

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
            ['start','end'].includes(state||'') && (roomProperties['state'] = state)
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
            } else if (state === "updateStudent") {
                if (this.globalContext.rosterUserList) {
                    let students:any = this.context.properties['students'] || []
                    roomProperties['students'] = []
                    roomProperties['studentNames'] = []

                    students.map((student: any,index: number) => {
                        if (getStudentInfo(this.context.properties['student' + student])) {
                            roomProperties['students'].push(student)
                            roomProperties['studentNames'].push(this.context.properties['studentNames'][index])
                        }
                    });

                    this.globalContext.rosterUserList?.map((user: any) => {
                        if (!(/^guest[0-9]{10}2$/).test(user.uid || '') && !roomProperties['students'].includes(user.uid)) {
                            roomProperties['students'].push(user.uid)
                            roomProperties['studentNames'].push(user.name)
                        }
                    }); 
                    if (JSON.stringify(students.slice().sort()) !== JSON.stringify(roomProperties['students'].slice().sort())) {
                        this.context.userList = this.globalContext.rosterUserList
                        console.log(roomProperties);
                    }else{
                        return;
                    }
                }else{
                    return;
                }
            } else if (state === "clear") {
                roomProperties['students'] = []
                roomProperties['studentNames'] = []
                roomProperties['state'] = ''
                roomProperties['canChange'] = false
                roomProperties['mulChoice'] = false
                roomProperties['startTime'] = ''
                roomProperties['endTime'] = ''
                roomProperties['title'] = ''
                roomProperties['items'] = []
                roomProperties['answer'] = []
                this.changeRoomProperties({ state: 'clearStudent' })
            } else if (state === "clearStudent") {
                let propers: string[] = [];
                let keys = Object.keys(this.context.properties)
                keys.map((ele: string) => {
                    ['answer','canChange','title','endTime','items','mulChoice','startTime','state','studentNames','students'].includes(ele) || propers.push(ele)
                })
                console.log('clearStudent:',this.context.properties.students,propers,this.context.properties);
                await this.handle.deleteRoomProperties(propers, {})
                return;
            }
            await this.handle.updateRoomProperty(roomProperties, { state: commonState || 0 }, {})
        } else {
            if (this.context.properties.state === "start") {
                roomProperties['student' + this.context.localUserInfo.userUuid] = { startTime: this.context.properties.startTime,replyTime, answer }
                await this.handle.updateRoomProperty(roomProperties, { state: commonState || 0 }, {startTime: this.context.properties.startTime});
            }
        }
    }

    onSubClick = (clear: boolean = false) => {
        if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
            if (clear) {
                this.changeRoomProperties({ state: 'clear' })
            } else {
                if (this.status === 'config') {
                    //this.changeRoomProperties({ state: 'clearStudent' })//删除属性会引起插件被关闭
                    this.changeRoomProperties({ state: 'start', startTime: (Math.floor(Date.now() / 1000)).toString(), title: this.title, items: this.answer, mulChoice: this.mulChoice, answer: [], commonState: 1 })
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
                    let answer = getStudentInfo(properties['student' + student])
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
                this.height = c2h(properties.title?.length || 0) + (this.answer?.length||0)*50 - 10 + (properties.state === 'end' ? 0 : 116)
                this.buttonName = properties.state === 'end' ? 'vote.restart' : 'vote.over'
                this.ui = properties.state === 'end' ? ['users', 'infos'] : ['users', 'infos', 'subs']
            } else {
                this.title = ""
                this.answer = ['', '']
                this.selAnswer = []
                this.currentTime = ''
                this.students = []
                this.status = 'config'
                this.height = 283
                this.buttonName = 'vote.start'
                this.ui = ['sels', 'subs']
            }
        } else {
            if (properties.state === 'start' && !getStudentInfo(properties['student' + this.context.localUserInfo.userUuid])) {
                this.title = properties.title
                this.answer = properties.items
                this.mulChoice = properties.mulChoice
                this.status = 'answer'
                this.height = c2h(properties.title?.length || 0) + (this.answer?.length||0)*50 - 10 + 116
                this.buttonName = !getStudentInfo(properties['student' + this.context.localUserInfo.userUuid]) ? 'vote.submit' : 'vote.change'
                this.ui = ['sels', 'subs']
            } else if (properties.state === 'end' || properties.state === 'start') {
                this.title = properties.title
                this.answer = properties.items
                this.mulChoice = properties.mulChoice
                this.selAnswer = getStudentInfo(properties['student' + this.context.localUserInfo.userUuid])?.answer || []
                this.status = 'info'
                this.height = c2h(properties.title?.length || 0) + (this.answer?.length||0)*50 - 10 + 20
                this.ui = ['infos']

                let selNumber = [0,0,0,0,0,0,0,0,0,0];
                properties.students.map((student: string, index: number) => {
                    let answer = getStudentInfo(properties['student' + student])
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
            this.height = 433 - (5-this.answer.length)*50
        }
    }

    @action
    subAnswer() {
        if (this.answer && this.answer.length > 2) {
            this.answer.splice(this.answer.length - 1, 1)
            this.height = 433 - (5-this.answer.length)*50
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
    
    @action
    updateGlobalContext(state:any) {
        if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
            this.globalContext = state
            if (this.status !== 'config' && this.status !== 'end') {
                this.changeRoomProperties({ state: 'updateStudent', commonState: 1 })
            }
        }
    }
}