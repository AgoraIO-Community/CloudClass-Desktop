import { EduRoleTypeEnum } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { useHandsUpContext, useRoomContext } from '~core/context/provider';
import { HandsUpManager, HandsUpSender, StudentInfo } from '~ui-kit';

export const HandsUpManagerContainer = observer(() => {

    const {
        handsUpState,
        processUserCount,
        onlineUserCount,
        coVideoUsers,
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
            state={handsUpState as any}
            onClick={handleUpdateList}
            studentList={coVideoUsers}
        />
    )
})


export const HandsUpReceiverContainer = observer(() => {

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
                break;
            }
            case 'apply': {
                await studentCancelHandsUp()
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