import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HandsUpManager, HandsUpSender, StudentInfo } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useSceneStore, useSmallClassStore } from '@/hooks';
import { EduRoleTypeEnum } from 'agora-rte-sdk';

export const HandsUpManagerContainer = observer(() => {

    const smallClassStore = useSmallClassStore()

    const coVideoUsers = smallClassStore.handsUpStudentList

    const handsUpState = 'default'

    const handleUpdateList = useCallback(async (type: string, info: StudentInfo) => {
        if (type === 'confirm') {
            await smallClassStore.teacherAcceptHandsUp(info.userUuid)
        }

        if (type === 'cancel') {
            await smallClassStore.teacherRejectHandsUp(info.userUuid)
        }
    }, [coVideoUsers, smallClassStore])

    return (
        <HandsUpManager
            unreadCount={0}
            state={handsUpState}
            onClick={handleUpdateList}
            studentList={coVideoUsers}
        />
    )
})


export const HandsUpReceiverContainer = observer(() => {

    const smallClass = useSmallClassStore()

    const teacherUuid = smallClass.teacherUuid

    const isCoVideo = smallClass.isCoVideo

    const handleClick = useCallback(async () => {
        if (isCoVideo) {
            await smallClass.studentDismissHandsUp(teacherUuid)
        } else {
            await smallClass.studentHandsUp(teacherUuid)
        }
    }, [isCoVideo, smallClass, teacherUuid])

    return (
        <HandsUpSender
            isActive={isCoVideo}
            onClick={handleClick}
        />
    )
})

const getHandsType = (role: EduRoleTypeEnum) => {

    const defaultType = null

    const map = {
        [EduRoleTypeEnum.teacher]: 'manager',
        [EduRoleTypeEnum.student]: 'receiver',
    }

    return map[role] || defaultType
}

export const useHandsUpContext = () => {
    const sceneStore = useSceneStore()

    const userRole = sceneStore.roomInfo.userRole

    return {
        handsType: getHandsType(userRole)
    }
}


export const HandsUpContainer = observer(() => {

    const {handsType} = useHandsUpContext()

    const switchMap = {
        'manager': <HandsUpManagerContainer />,
        'receiver': <HandsUpReceiverContainer />
    }
    return switchMap[handsType] || null
})