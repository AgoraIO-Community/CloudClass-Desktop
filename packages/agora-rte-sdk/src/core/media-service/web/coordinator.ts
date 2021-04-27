import { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { EduStreamData } from "../../../interfaces";
import { difference, throttle } from 'lodash'
import { EventEmitter } from "events";

type StreamSnapshot = {
    eduStreams: Map<string, EduStreamData>, 
    rtcVideoStreams: Map<string,IAgoraRTCRemoteUser>,
    rtcAudioStreams:Map<string,IAgoraRTCRemoteUser>,
    subscribeOptions:StreamSubscribeOptions
}

type StreamUpdateTask = {
    oldSnapshot: StreamSnapshot
    newSnapshot: StreamSnapshot
}

export type StreamSubscribeOptions = {
    includeVideoStreams?: string[],
    excludeVideoStreams?: string[],
    includeAudioStreams?: string[],
    excludeAudioStreams?: string[]
}

export class AgoraWebStreamCoordinator extends EventEmitter  {

    eduStreams: Map<string, EduStreamData> = new Map<string, EduStreamData>()
    rtcVideoStreams: Map<string,IAgoraRTCRemoteUser> = new Map<string,IAgoraRTCRemoteUser>()
    rtcAudioStreams: Map<string,IAgoraRTCRemoteUser> = new Map<string,IAgoraRTCRemoteUser>()
    subscribeOptions: StreamSubscribeOptions = {}

    queueTasks: StreamUpdateTask[] = []
    currentTask?: StreamUpdateTask

    client?: IAgoraRTCClient

    constructor() {
        super()
    }

    updateRtcClient(client:IAgoraRTCClient) {
        this.client = client
    }

    addRtcStream(user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") {
        let snapshot = this.beginUpdate()
        if (mediaType === 'audio') {
            this.rtcAudioStreams.set(`${user.uid}`, user)
        }
        if (mediaType === 'video') {
            this.rtcVideoStreams.set(`${user.uid}`, user)
        }
        this.endUpdate(snapshot)
    }

    removeRtcStream(user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") {
        let snapshot = this.beginUpdate()
        if (mediaType === 'audio') {
            this.rtcAudioStreams.delete(`${user.uid}`)
        }
        if (mediaType === 'video') {
            this.rtcVideoStreams.delete(`${user.uid}`)
        }
        this.endUpdate(snapshot)
    }

    addEduStreams(streams: EduStreamData[]) {
        let snapshot = this.beginUpdate()
        streams.forEach(stream => this.eduStreams.set(stream.stream.streamUuid, stream))
        this.endUpdate(snapshot)
    }

    removeEduStreams(streams: EduStreamData[]) {
        let snapshot = this.beginUpdate()
        streams.forEach(stream => this.eduStreams.delete(stream.stream.streamUuid))
        this.endUpdate(snapshot)
    }

    updateSubscribeOptions(options: StreamSubscribeOptions) {
        let snapshot = this.beginUpdate()
        this.subscribeOptions = Object.assign(this.subscribeOptions, options)
        this.endUpdate(snapshot)
    }

    makeSnapshot():StreamSnapshot {
        return {
            eduStreams: new Map<string, EduStreamData>(this.eduStreams), 
            rtcVideoStreams: new Map<string,IAgoraRTCRemoteUser>(this.rtcVideoStreams),
            rtcAudioStreams:new Map<string,IAgoraRTCRemoteUser>(this.rtcAudioStreams),
            subscribeOptions: Object.assign({}, this.subscribeOptions)
        }
    }

    beginUpdate():StreamSnapshot {
        return this.makeSnapshot()
    }

    endUpdate(oldSnapshot: StreamSnapshot) {
        let newSnapshot = this.makeSnapshot()
        this.addTask({oldSnapshot, newSnapshot})
    }

    getOnlineStreams(snapshot: StreamSnapshot) {
        let onlineVideoStreams:string[] = []
        let onlineAudioStreams:string[] = []
        snapshot.eduStreams.forEach(stream => {
            if(stream.stream.hasVideo && snapshot.rtcVideoStreams.has(stream.stream.streamUuid)) {
                onlineVideoStreams.push(stream.stream.streamUuid)
            }
            if(stream.stream.hasAudio && snapshot.rtcAudioStreams.has(stream.stream.streamUuid)) {
                onlineAudioStreams.push(stream.stream.streamUuid)
            }
        })
        let {
            includeAudioStreams,
            includeVideoStreams,
            excludeAudioStreams,
            excludeVideoStreams
        } = snapshot.subscribeOptions
        if(includeVideoStreams) {
            let includeVideoStreamsMap:Map<string, boolean> = new Map()
            includeVideoStreams.map(streamUuid => {
                includeVideoStreamsMap.set(streamUuid, true)
            })
            onlineVideoStreams = onlineVideoStreams.filter(s => includeVideoStreamsMap.has(s))
        } else if(excludeVideoStreams) {
            let excludeVideoStreamsMap:Map<string, boolean> = new Map()
            excludeVideoStreams.map(streamUuid => {
                excludeVideoStreamsMap.set(streamUuid, true)
            })
            onlineVideoStreams = onlineVideoStreams.filter(s => !excludeVideoStreamsMap.has(s))
        }
        if(includeAudioStreams) {
            let includeAudioStreamsMap:Map<string, boolean> = new Map()
            includeAudioStreams.map(streamUuid => {
                includeAudioStreamsMap.set(streamUuid, true)
            })
            onlineAudioStreams = onlineAudioStreams.filter(s => includeAudioStreamsMap.has(s))
        } else if(excludeAudioStreams) {
            let excludeAudioStreamsMap:Map<string, boolean> = new Map()
            excludeAudioStreams.map(streamUuid => {
                excludeAudioStreamsMap.set(streamUuid, true)
            })
            onlineAudioStreams = onlineAudioStreams.filter(s => !excludeAudioStreamsMap.has(s))
        }
        return {onlineVideoStreams, onlineAudioStreams}
    }

    diffSnapshots(oldSnapshot:StreamSnapshot, newSnapshot:StreamSnapshot) {
        let {onlineVideoStreams:oldOnlineVideoStreams, onlineAudioStreams: oldOnlineAudioStreams} = this.getOnlineStreams(oldSnapshot)
        let {onlineVideoStreams:newOnlineVideoStreams, onlineAudioStreams: newOnlineAudioStreams} = this.getOnlineStreams(newSnapshot)

        let offlineVideoStreams = difference(oldOnlineVideoStreams, newOnlineVideoStreams)
        let onlineVideoStreams = difference(newOnlineVideoStreams, oldOnlineVideoStreams)
        let offlineAudioStreams = difference(oldOnlineAudioStreams, newOnlineAudioStreams)
        let onlineAudioStreams = difference(newOnlineAudioStreams, oldOnlineAudioStreams)

        console.log(`[StreamCoordinator] diff ${JSON.stringify({offlineVideoStreams, offlineAudioStreams, onlineVideoStreams, onlineAudioStreams})}`)
        return {offlineVideoStreams, offlineAudioStreams, onlineVideoStreams, onlineAudioStreams}
    }

    addTask(task: StreamUpdateTask) {
        this.queueTasks.push(task)
        this.notifyTaskQueueUpdate()
    }

    notifyTaskQueueUpdate() {
        this.runNextTask()
    }

    runNextTask = async () => {
        if(this.currentTask) {
            console.log(`[StreamCoordinator] Task Running`)
            return
        }

        let task  = this.dequeueTask()
        if(!task) {
            console.log(`[StreamCoordinator] Stream snapshot queue clear`)
            return
        } else {
            this.currentTask = task
            try {
                await this.processSnapshotsUpdate(this.currentTask)
                this.currentTask = undefined
            }catch(e) {
                this.currentTask = undefined
            }
            this.notifyTaskQueueUpdate()
        }
    }

    dequeueTask() {
        if(this.queueTasks.length === 0) {
            return null
        } else if(this.queueTasks.length === 1) {
            return this.queueTasks.shift()
        } else if(this.queueTasks.length > 1) {
            let firstTask = this.queueTasks.shift()!
            let lastTask = this.queueTasks.pop()!
            // merge tasks
            this.queueTasks = []
            return {oldSnapshot: firstTask.oldSnapshot, newSnapshot: lastTask.newSnapshot}
        }
    }

    processSnapshotsUpdate = (task: StreamUpdateTask) => {
        return new Promise<void>((resolve, reject) => {
            let {oldSnapshot, newSnapshot} = task
            let {offlineVideoStreams, offlineAudioStreams, onlineVideoStreams, onlineAudioStreams} = this.diffSnapshots(oldSnapshot, newSnapshot)
            let promises:Promise<boolean>[] = []

            offlineVideoStreams.forEach(streamUuid => {
                if(this.rtcVideoStreams.has(streamUuid)) {
                    let user = this.rtcVideoStreams.get(streamUuid)!
                    promises.push(new Promise(async (resolve) => {
                        try {
                            await this.client?.unsubscribe(user, "video")
                            this.emit('user-unpublished', user, "video")
                            resolve(true)
                        } catch(e) {
                            console.error(e.stack)
                            resolve(false)
                        }
                    }))
                }
            })

            offlineAudioStreams.forEach(streamUuid => {
                if(this.rtcAudioStreams.has(streamUuid)) {
                    let user = this.rtcAudioStreams.get(streamUuid)!
                    promises.push(new Promise(async (resolve) => {
                        try {
                            await this.client?.unsubscribe(user, "audio")
                            resolve(true)
                        } catch(e) {
                            console.error(e.stack)
                            resolve(false)
                        }
                    }))
                }
            })

            onlineVideoStreams.forEach(streamUuid => {
                if(this.rtcVideoStreams.has(streamUuid)) {
                    let user = this.rtcVideoStreams.get(streamUuid)!
                    promises.push(new Promise(async (resolve) => {
                        try {
                            await this.client?.subscribe(user, "video")
                            console.log('Agora-SDK client subscribe' , user)
                            this.emit('user-published', user, "video")
                            resolve(true)
                        } catch(e) {
                            console.error(e.stack)
                            resolve(false)
                        }
                    }))
                }
            })

            onlineAudioStreams.forEach(streamUuid => {
                if(this.rtcAudioStreams.has(streamUuid)) {
                    let user = this.rtcAudioStreams.get(streamUuid)!
                    promises.push(new Promise(async (resolve) => {
                        try {
                            await this.client?.subscribe(user, "audio")
                            if(user.audioTrack) {
                                !user.audioTrack.isPlaying && user.audioTrack.play()
                            }
                            resolve(true)
                        } catch(e) {
                            console.error(e.stack)
                            resolve(false)
                        }
                    }))
                }
            })

            Promise.all(promises).then(() => {
                resolve()
            }).catch(e => {
                reject(e)
            })
        })
    }
 }