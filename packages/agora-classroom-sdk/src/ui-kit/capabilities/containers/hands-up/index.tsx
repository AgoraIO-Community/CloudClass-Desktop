import { EduRoleTypeEnum} from 'agora-rte-sdk';
import { useHandsUpContext, useRoomContext } from 'agora-edu-core'
import { observer } from 'mobx-react';
import { HandsUpManager, HandsUpSender, StudentInfo, transI18n } from '~ui-kit';
import { useUIStore } from '@/infra/hooks';
import { useState, useEffect } from 'react';
import { useEffectOnce } from '@/infra/hooks/utils';

export const HandsUpManagerContainer = observer(() => {

    const {
        teacherHandsUpState,
        processUserCount,
        onlineUserCount,
        handsUpStudentList,
        teacherAcceptHandsUp,
        teacherRejectHandsUp,
    } = useHandsUpContext()

    const handleUpdateList = async (type: string, info: StudentInfo) => {
        switch (type) {
            case 'confirm': {
                await teacherAcceptHandsUp(info.userUuid)
                break;
            }
            case 'cancel': {
                await teacherRejectHandsUp(info.userUuid)
                break;
            }
        }
    }

    return (
        <HandsUpManager
            processUserCount={processUserCount}
            onlineUserCount={onlineUserCount}
            unreadCount={0}
            state={teacherHandsUpState as any}
            onClick={handleUpdateList}
            studentList={handsUpStudentList}
        />
    )
})


export const HandsUpReceiverContainer = observer(() => {

    const {
        addToast
    } = useUIStore()

    const {
        handsUpState,
        studentHandsUp,
        studentCancelHandsUp,
        teacherUuid
    } = useHandsUpContext()

    const [animate,setAnimate] = useState<number>(0)

    const [timer,setTimer] = useState<any>(null)

    useEffectOnce(()=>{
        return ()=>{
            if (timer) {
                clearInterval(timer)
                setTimer(null)
                setAnimate(0)
            }
        }
    })

    useEffect(()=>{
        if (animate > 0) {
            if (!timer) {
                setTimer(setInterval(()=>{setAnimate(n => n - 1)},1000))
            }
        }else{
            if (timer) {
                clearInterval(timer)
                setTimer(null)
            }
            if (handsUpState === 'actived') {
                studentCancelHandsUp()
            }
        }
    },[animate,timer,handsUpState])

    const handleClick = async () => {
        if (handsUpState !== 'forbidden') {
            if (animate > 0) {
                setAnimate(3)
            }else{
                try {
                    await studentHandsUp(teacherUuid)
                    setAnimate(3)
                } catch (error) {
                    addToast(transI18n('co_video.received_message_timeout'), 'warning')
                }
            }
        }else{
            setAnimate(0)
        }
    }

    return (
        <HandsUpSender
            state={handsUpState as any}
            onClick={handleClick}
            animate={animate}
        />
    )
})

export const HandsUpContainer = observer(() => {

    const getHandsType = (role: EduRoleTypeEnum) => {
        const defaultType = null  
        const map = {
            [EduRoleTypeEnum.teacher]: 'manager',
            [EduRoleTypeEnum.student]: 'receiver',
        }
        return map[role] || defaultType
    }

    const {roomInfo} = useRoomContext()

    const handsType = getHandsType(roomInfo.userRole)

    const switchMap = {
        'manager': <HandsUpManagerContainer />,
        'receiver': <HandsUpReceiverContainer />
    }
    return switchMap[handsType] || null
})