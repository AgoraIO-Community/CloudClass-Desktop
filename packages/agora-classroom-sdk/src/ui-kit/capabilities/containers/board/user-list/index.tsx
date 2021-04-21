import { Roster } from '~ui-kit';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useUserListContext, useStreamListContext, useBoardContext, useGlobalContext, useRoomContext } from 'agora-edu-core';
import { EduRoleTypeEnum, EduStream } from 'agora-rte-sdk';
import { RosterUserInfo } from '@/infra/stores/types';
import { get } from 'lodash';
import { useCallback } from 'react';
import { StudentRoster } from '@/ui-kit/components';

export type UserListContainerProps = {
    onClose: () => void
}

export const UserListContainer: React.FC<UserListContainerProps> = observer((props) => {

    const {
        revokeBoardPermission,
        grantBoardPermission,
    } = useBoardContext()

    const {
        streamList
    } = useStreamListContext()

    const {
        addDialog,
    } = useGlobalContext()

    const {
        muteVideo,
        muteAudio,
        unmuteAudio,
        unmuteVideo,
        roomInfo
    } = useRoomContext()

    const {
        localUserUuid,
        myRole,
        teacherName,
        rosterUserList,
        revokeCoVideo,
        teacherAcceptHandsUp,
    } = useUserListContext()

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
                        await revokeCoVideo(user.uid)
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
            case 'kick-out': {
                if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                    addDialog('kick-dialog', { userUuid: uid, roomUuid: roomInfo.roomUuid })
                }
                break;
            }
        }
    }, [rosterUserList, roomInfo.roomUuid, roomInfo.userRole])

    return (
        <Roster
            isDraggable={true}
            localUserUuid={localUserUuid}
            role={myRole as any}
            teacherName={teacherName}
            dataSource={rosterUserList}
            onClick={onClick}
            onClose={props.onClose}
        />
    )
})

export const StudentUserListContainer: React.FC<UserListContainerProps> = observer((props) => {

    const {
        streamList
    } = useStreamListContext()

    const {
        addDialog,
    } = useGlobalContext()

    const {
        muteVideo,
        muteAudio,
        unmuteAudio,
        unmuteVideo,
        roomInfo
    } = useRoomContext()

    const {
        localUserUuid,
        myRole,
        teacherName,
        rosterUserList,
    } = useUserListContext()

    const onClick = useCallback(async (actionType: any, uid: any) => {
        const userList = rosterUserList
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
            case 'kick-out': {
                if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(roomInfo.userRole)) {
                    addDialog('kick-dialog', { userUuid: uid, roomUuid: roomInfo.roomUuid })
                }
                break;
            }
        }
    }, [rosterUserList, roomInfo.roomUuid, roomInfo.userRole])

    return (
        <StudentRoster
            isDraggable={true}
            localUserUuid={localUserUuid}
            role={myRole as any}
            teacherName={teacherName}
            dataSource={rosterUserList}
            userType={'teacher'}
            onClick={onClick}
            onClose={props.onClose}
            onChange={(evt: any) => {
                console.log("onchange " ,evt.target.value)
            }}
        />
    )
})