import { EduRoleTypeEnum} from 'agora-rte-sdk';
import { useHandsUpContext, useRoomContext } from 'agora-edu-core'
import { observer } from 'mobx-react';
import { HandsUpManager, HandsUpSender, StudentInfo } from '~ui-kit';
import { transI18n } from '@/ui-kit/components';
import { useUIStore } from '@/infra/hooks';

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

    const handleClick = async () => {
        switch(handsUpState) {
            case 'default': {
                await studentHandsUp(teacherUuid)
                addToast(transI18n('co_video.hands_up_requsted'), 'success')
                break;
            }
            case 'actived': {
                await studentCancelHandsUp()
                addToast(transI18n('co_video.hands_up_cancelled'), 'warning')
                break;
            }
        }
    }

    return (
        <HandsUpSender
            state={handsUpState as any}
            onClick={handleClick}
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