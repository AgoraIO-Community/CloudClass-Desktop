import { EduRoleTypeEnum} from 'agora-rte-sdk';
import { useHandsUpContext, useRoomContext } from 'agora-edu-core'
import { observer } from 'mobx-react';
import { HandsUpManager, HandsUpSender, StudentInfo, HandsStudentInfo, transI18n } from '~ui-kit';
import { useUIStore } from '@/infra/hooks';
import { useState, useEffect } from 'react';
import { useEffectOnce } from '@/infra/hooks/utils';

export const HandsUpManagerContainer = observer(() => {

    const {
        teacherHandsUpState,
        processUserCount,
        onlineUserCount,
        handsUpStudentList,
        coVideoUsers,
        applyCoVideoUserList,
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

    const [handsList,setHandsList] = useState<Array<HandsStudentInfo>>([])

    const handsVisibleChanged = () => {
        let hands:HandsStudentInfo[] = []
        handsUpStudentList.map((ele:StudentInfo)=>{
            hands.push({...ele,hands:applyCoVideoUserList.find(s=>s.userUuid===ele.userUuid)!==undefined})
        })
        setHandsList(hands)
    }

    useEffect(()=>{
        let hands = [...handsList]
        hands.map(ele=> ele.hands = false)
        handsUpStudentList.map((ele:StudentInfo)=>{
            let _ele:HandsStudentInfo|undefined = hands.find(s=>s.userUuid===ele.userUuid)
            let i = _ele?hands.indexOf(_ele):-1
            if(i < 0){
                hands.push({...ele,hands:applyCoVideoUserList.find(s=>s.userUuid===ele.userUuid)!==undefined})
            }else{
                hands.splice(i,1,{...ele,hands:applyCoVideoUserList.find(s=>s.userUuid===ele.userUuid)!==undefined})
            }
        })
        setHandsList(hands)
    },[handsUpStudentList])

    return (
        <HandsUpManager
            processUserCount={processUserCount}
            onlineUserCount={onlineUserCount}
            unreadCount={0}
            state={teacherHandsUpState as any}
            onClick={handleUpdateList}
            onClear={handsVisibleChanged}
            studentList={handsList}
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