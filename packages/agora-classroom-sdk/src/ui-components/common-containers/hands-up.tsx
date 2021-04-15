import { useCallback, useEffect, useRef, useState } from 'react';
import { HandsUpManager, HandsUpSender, StudentInfo } from '~ui-kit'
import { observer } from 'mobx-react'
import { useSceneStore, useSmallClassStore } from '@/hooks';
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { useHandsUpContext, useHandsUpManager, useHandsUpSender } from '../hooks';

export const HandsUpManagerContainer = observer(() => {

    const {
        handsUpState,
        handleUpdateList,
        coVideoUsers,
        onlineUserCount,
        processUserCount,
    } = useHandsUpManager()

    return (
        <HandsUpManager
            processUserCount={processUserCount}
            onlineUserCount={onlineUserCount}
            unreadCount={0}
            state={handsUpState}
            onClick={handleUpdateList}
            studentList={coVideoUsers}
        />
    )
})


export const HandsUpReceiverContainer = observer(() => {

    const {handsUpState, handleClick} = useHandsUpSender()

    return (
        <HandsUpSender
            state={handsUpState}
            onClick={handleClick}
        />
    )
})

export const HandsUpContainer = observer(() => {

    const {handsType} = useHandsUpContext()

    const switchMap = {
        'manager': <HandsUpManagerContainer />,
        'receiver': <HandsUpReceiverContainer />
    }
    return switchMap[handsType] || null
})