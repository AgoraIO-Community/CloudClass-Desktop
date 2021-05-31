import { Roster } from '~ui-kit';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useUserListContext, useStreamListContext, useBoardContext, useGlobalContext, useRoomContext, useChatContext, useHandsUpContext } from 'agora-edu-core';
import { EduRoleTypeEnum, EduStream, EduUser, EduVideoSourceType } from 'agora-rte-sdk';
import { RosterUserInfo } from '@/infra/stores/types';
import { get } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { StudentRoster } from '~ui-kit/components';
import { KickDialog } from '../../dialog';
import { useUIStore } from '@/infra/hooks';

export type UserListContainerProps = {
    onClose: () => void
}

export const UserListContainer: React.FC<UserListContainerProps> = observer((props) => {
    const {
        revokeBoardPermission,
        grantBoardPermission,
    } = useBoardContext()

    const {
        streamList,
        muteVideo,
        muteAudio,
        unmuteAudio,
        unmuteVideo
    } = useStreamListContext()

    const {
        addDialog,
    } = useUIStore()

    const {
        // muteVideo,
        // muteAudio,
        // unmuteAudio,
        // unmuteVideo,
        // muteUserChat,
        // unmuteUserChat,
        roomInfo
    } = useRoomContext()

    const {
        muteUserChat,
        unmuteUserChat
    } = useChatContext()

    const {
        localUserInfo,
        teacherInfo,
        rosterUserList
    } = useUserListContext()

    const {
        teacherAcceptHandsUp,
        teacherRevokeCoVideo
    } = useHandsUpContext()

    const onClick = useCallback(async (actionType: any, uid: any) => {
        const userList = rosterUserList
        const user = userList.find((user: RosterUserInfo) => user.uid === uid)

        if (!user) {
            return
        }
        switch (actionType) {
            case 'podium': {
                if (user.onPodium) {
                    if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                        await teacherRevokeCoVideo(user.uid)
                    }
                } else {
                    if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                        await teacherAcceptHandsUp(user.uid)
                    }
                }
                break;
            }
            case 'whiteboard': {
                if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                    if (user.whiteboardGranted) {
                        await revokeBoardPermission(uid)
                    } else {
                        await grantBoardPermission(uid)
                    }
                }
                break;
            }
            case 'camera': {
                const targetStream = streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === uid)
                if (targetStream) {
                    const isLocal = roomInfo.userUuid === uid
                    if (targetStream.hasVideo) {
                        await muteVideo(uid, isLocal)
                    } else {
                        await unmuteVideo(uid, isLocal)
                    }
                }
                break;
            }
            case 'chat': {
                const targetUser = rosterUserList.find((user) => get(user, 'uid', '') === uid)
                if (targetUser) {
                    if (targetUser.chatEnabled) {
                        await muteUserChat(uid)
                    } else {
                        await unmuteUserChat(uid)
                    }
                }
                break;
            }
            case 'mic': {
                const targetStream = streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === uid)
                if (targetStream) {
                    const isLocal = roomInfo.userUuid === uid
                    if (targetStream.hasAudio) {
                        await muteAudio(uid, isLocal)
                    } else {
                        await unmuteAudio(uid, isLocal)
                    }
                }
                break;
            }
            case 'kickOut': {
                if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                    addDialog(KickDialog, { userUuid: uid, roomUuid: roomInfo.roomUuid })
                }
                break;
            }
        }
    }, [rosterUserList, roomInfo.roomUuid, roomInfo.userRole])

    const [keyword, setKeyword] = useState<string>('')

    const dataList = useMemo(() => {
        return rosterUserList.filter((item: any) => item.name.toLowerCase().includes(keyword.toLowerCase()))
      }, [keyword, rosterUserList])

      const userType = useMemo(() => {
        if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
            return 'teacher'
        }
        return 'student'
    }, [roomInfo.userRole])

    return (
        <Roster
            isDraggable={true}
            localUserUuid={localUserInfo.userUuid}
            teacherName={teacherInfo?.userName || ''}
            dataSource={dataList}
            userType={userType}
            onClick={onClick}
            onClose={props.onClose}
            onChange={(text: string) => {
                setKeyword(text)
            }}
        />
    )
})

export const StudentUserListContainer: React.FC<UserListContainerProps> = observer((props) => {

    const [keyword, setKeyword] = useState<string>('')

    const {
        streamList,
        localStream,
        muteVideo,
        muteAudio,
        unmuteAudio,
        unmuteVideo
    } = useStreamListContext()

    const {
        addDialog,
    } = useUIStore()

    const {
        queryMicrophoneDeviceState,
        queryCameraDeviceState,
        roomInfo
    } = useRoomContext()

    const {
        muteUserChat,
        unmuteUserChat
    } = useChatContext()

    const {
        localUserInfo,
        teacherInfo,
        userList,
        acceptedUserList
    } = useUserListContext()

    function checkDisable(user: any, role: EduRoleTypeEnum): boolean {
        if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role)) {
          return false
        }
    
        if (role === EduRoleTypeEnum.student 
            && roomInfo.userUuid === user.userUuid
            && acceptedIds.includes(user.userUuid)
          ) {
          return false
        }
        return true
      }

    function transformRosterUserInfo(user: any, role: any, stream: any, onPodium: boolean, userList: EduUser[]) {
        return {
            name: user.userName,
            uid: user.userUuid,
            micEnabled: stream?.hasAudio ?? false,
            cameraEnabled: stream?.hasVideo ?? false,
            onPodium: onPodium,
            micDevice: queryMicrophoneDeviceState(userList, user?.userUuid ?? '', stream?.streamUuid ?? ''),
            cameraDevice: queryCameraDeviceState(userList, user?.userUuid ?? '', stream?.streamUuid ?? ''),
            online: userList.find((it: EduUser) => it.userUuid === user.userUuid),
            hasStream: !!stream,
            chatEnabled: !get(user, 'userProperties.mute.muteChat', 0),
            disabled: checkDisable(user, role),
            userType: ['assistant', 'teacher'].includes(role) ? 'teacher' : 'student'
        }
    }

    const acceptedIds = acceptedUserList.map((user: any) => user.userUuid)

    const {
        rosterUserList,
    } = useUserListContext()

    const dataList = useMemo(() => {
        return rosterUserList.filter((item: any) => item.name.toLowerCase().includes(keyword.toLowerCase()))
      }, [keyword, rosterUserList])

    const onClick = useCallback(async (actionType: any, uid: any) => {
        const userList = dataList
        const user = userList.find((user: RosterUserInfo) => user.uid === uid)

        if (!user) {
            return
        }
        switch (actionType) {
            case 'camera': {
                const targetStream = streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === uid)
                if (targetStream) {
                    const isLocal = roomInfo.userUuid === uid
                    if (targetStream.hasVideo) {
                        await muteVideo(uid, isLocal)
                    } else {
                        await unmuteVideo(uid, isLocal)
                    }
                }
                break;
            }
            case 'mic': {
                const targetStream = streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === uid)
                if (targetStream) {
                    const isLocal = roomInfo.userUuid === uid
                    if (targetStream.hasAudio) {
                        await muteAudio(uid, isLocal)
                    } else {
                        await unmuteAudio(uid, isLocal)
                    }
                }
                break;
            }
            case 'chat': {
                const targetUser = dataList.find((user) => get(user, 'uid', '') === uid)
                if (targetUser) {
                    if (targetUser.chatEnabled) {
                        await muteUserChat(uid)
                    } else {
                        await unmuteUserChat(uid)
                    }
                }
                break;
            }
            case 'kickOut': {
                if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                    addDialog(KickDialog, { userUuid: uid, roomUuid: roomInfo.roomUuid })
                }
                break;
            }
        }
    }, [dataList, roomInfo.roomUuid, roomInfo.userRole])

    const userType = useMemo(() => {
        if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
            return 'teacher'
        }
        return 'student'
    }, [roomInfo.userRole])

    return (
        <StudentRoster
            isDraggable={true}
            localUserUuid={localUserInfo.userUuid}
            // role={localUserInfo.role as any}
            teacherName={teacherInfo?.userName || ''}
            dataSource={dataList}
            userType={userType}
            onClick={onClick}
            onClose={props.onClose}
            onChange={(text: string) => {
                setKeyword(text)
            }}
        />
    )
})