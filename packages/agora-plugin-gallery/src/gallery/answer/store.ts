import { action, observable, computed, runInAction } from 'mobx';
import type { AgoraExtAppContext, AgoraExtAppHandle } from 'agora-edu-core'
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { Toast, transI18n } from '~ui-kit'

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

export class PluginStore {
    context: AgoraExtAppContext
    handle: AgoraExtAppHandle

    @observable
    height?: number = 150
    @observable
    title?: string = ''
    @observable
    answer?: string[] = ['A', 'B', 'C', 'D']
    @observable
    selAnswer?: string[] = []
    @observable
    currentTime?: string = ''
    @observable
    students?: any[]
    @observable
    status: string = 'config'//config,answer,info,end
    @observable
    answerInfo?: { 'number-answered': string, 'acc': string, 'right-key': string, 'my-answer': string }
    @observable
    buttonName?: string = 'answer.start'
    @observable
    ui?: string[] = ['sels']//'sels','users','infos','subs'
    @observable
    timehandle?: any = null
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
        canChange = true,
        mulChoice = true,
        startTime,
        endTime,
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
            mulChoice && (roomProperties['mulChoice'] = mulChoice)
            startTime && (roomProperties['startTime'] = startTime)
            endTime && (roomProperties['endTime'] = endTime)
            items && (roomProperties['items'] = items)
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
                    let users:any = []
                    this.context.userList?.map((user: any) => {
                        if (!(/^guest[0-9]{10}2$/).test(user.uid || '')) {
                            users.push(user.uid)
                        }
                    });

                    roomProperties['students'] = []
                    roomProperties['studentNames'] = []
                    this.globalContext.rosterUserList?.map((user: any) => {
                        if (!(/^guest[0-9]{10}2$/).test(user.uid || '')) {
                            roomProperties['students'].push(user.uid)
                            roomProperties['studentNames'].push(user.name)
                        }
                    }); 
                    if (JSON.stringify(users.slice().sort()) !== JSON.stringify(roomProperties['students'].slice().sort())) {
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
                roomProperties['canChange'] = true
                roomProperties['mulChoice'] = true
                roomProperties['startTime'] = ''
                roomProperties['endTime'] = ''
                roomProperties['items'] = []
                roomProperties['answer'] = []

                this.changeRoomProperties({ state: 'clearStudent' })
            } else if (state === "clearStudent") {
                let propers: string[] = [];
                this.context.properties.students && this.context.properties.students.map((ele: string) => {
                    propers.push('student' + ele)
                })
                console.log('clearStudent:',this.context.properties.students,propers,this.context.properties);
                await this.handle.deleteRoomProperties(propers, {})
                return;
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
                    //this.changeRoomProperties({ state: 'clearStudent' })//删除属性会引起插件被关闭
                    this.changeRoomProperties({ state: 'start', startTime: (Math.floor(Date.now() / 1000)).toString(), items: this.answer, answer: sels, commonState: 1 })
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
                this.title = ""
                this.answer = properties.items
                this.selAnswer = []
                this.currentTime = formatTime(properties.endTime ? Number(properties.endTime) - Number(properties.startTime) : Math.floor(Date.now() / 1000) - Number(properties.startTime))
                this.students = []
                let answeredNumber = 0;
                let rightNumber = 0;
                properties.students.map((student: string, index: number) => {
                    let info = {
                        'name': properties.studentNames[index],
                        'replyTime': '',
                        'answer': ''
                    }
                    let answer = getStudentInfo(properties['student' + student])
                    if (answer) {
                        ++answeredNumber;
                        info.answer = answer.answer?.join('') || '';
                        info.replyTime = formatTime(Number(answer.replyTime) - Number(properties.startTime))
                        if (info.answer === (properties.answer?.join('') || '')) {
                            ++rightNumber
                        }
                    }
                    this.students?.push(info)
                })
                this.answerInfo = { 'number-answered': '' + answeredNumber + '/' + properties.students.length, 'acc': '' + Math.floor(100 * rightNumber / (properties.students.length || 1)) + '%', 'right-key': properties.answer?.join('、') || '', 'my-answer': '' }
                this.status = properties.state === 'end' ? 'end' : 'info'
                this.height = properties.state === 'end' ? 366 : 366
                this.buttonName = properties.state === 'end' ? 'answer.restart' : 'answer.over'
                this.ui = properties.state === 'end' ? ['users', 'infos', 'subs'] : ['users', 'infos', 'subs']
                this.updateTime();
            } else {
                this.title = ""
                this.answer = ['A', 'B', 'C', 'D']
                this.selAnswer = []
                this.currentTime = ''
                this.students = []
                this.status = 'config'
                this.height = 150
                this.buttonName = 'answer.start'
                this.ui = ['sels', 'subs']
            }
        } else {
            if (properties.state === 'start') {
                this.title = ""
                this.answer = properties.items
                this.currentTime = formatTime(properties.endTime ? Number(properties.endTime) - Number(properties.startTime) : Math.floor(Date.now() / 1000) - Number(properties.startTime))
                this.status = 'answer'
                this.height = (this.answer?.length || 0) > 4 ? 220 : 150
                this.buttonName = !getStudentInfo(properties['student' + this.context.localUserInfo.userUuid]) ? 'answer.submit' : 'answer.change'
                this.ui = ['sels', 'subs']
                if (this.status !== 'answer') {
                    this.selAnswer = getStudentInfo(properties['student' + this.context.localUserInfo.userUuid])?.answer || []
                }
                this.updateTime();
            } else if (properties.state === 'end') {
                this.title = ""
                this.answer = properties.answer
                this.selAnswer = getStudentInfo(properties['student' + this.context.localUserInfo.userUuid])?.answer || []
                this.currentTime = formatTime(properties.endTime ? Number(properties.endTime) - Number(properties.startTime) : Math.floor(Date.now() / 1000) - Number(properties.startTime))
                this.status = 'info'
                this.height = 120
                this.ui = ['infos']

                let answeredNumber = 0;
                let rightNumber = 0;
                properties.students.map((student: string, index: number) => {
                    let info = {
                        'name': properties.studentNames[index],
                        'replyTime': '',
                        'answer': ''
                    }
                    let answer = getStudentInfo(properties['student' + student])
                    if (answer) {
                        ++answeredNumber;
                        info.answer = answer.answer?.join('') || '';
                        info.replyTime = formatTime(Number(answer.replyTime) - Number(properties.startTime))
                        if (info.answer === (properties.answer?.join('') || '')) {
                            ++rightNumber
                        }
                    }
                })
                this.answerInfo = { 'number-answered': '' + answeredNumber + '/' + properties.students.length, 'acc': '' + Math.floor(100 * rightNumber / (properties.students.length || 1)) + '%', 'right-key': properties.answer?.join('') || '', 'my-answer': this.selAnswer?.join('') || '' }
                this.updateTime();
            } else {
                this.status = 'end'
                this.title = ""
                this.answer = ['A', 'B', 'C', 'D']
                this.selAnswer = []
                this.currentTime = ''
                this.students = []
                this.status = 'config'
                this.height = 150
                this.buttonName = 'answer.submit'
                this.ui = ['infos']
            }
        }
    }

    @action
    addAnswer() {
        const answer = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        if (this.answer && this.answer.length < 8) {
            this.answer.push(answer[this.answer.length])
            this.height = this.answer.length > 4 ? 220 : 150
        }
    }

    @action
    subAnswer() {
        if (this.answer && this.answer.length > 2) {
            this.answer.splice(this.answer.length - 1, 1)
            this.height = this.answer.length > 4 ? 220 : 150
        }
    }

    @action
    changeSelAnswer(sel: string) {
        if (this.selAnswer?.includes(sel)) {
            this.selAnswer.splice(this.selAnswer.indexOf(sel), 1);
        } else {
            this.selAnswer?.push(sel)
        }
        if (this.selAnswer) {
            this.selAnswer = this.selAnswer?.slice().sort()
        }
    }

    @action
    updateGlobalContext(state:any) {
        if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
            this.globalContext = state
            if (this.status !== 'config') {
                this.changeRoomProperties({ state: 'updateStudent', commonState: 1 })
            }
        }
    }
}