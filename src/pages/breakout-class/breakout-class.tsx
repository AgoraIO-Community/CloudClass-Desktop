import React, { useState, useEffect } from 'react';
import { NetlessBoard } from '@/components/netless-board';
import { ScreenSharing } from '@/components/screen-sharing';
import { ChatBoard } from '@/components/chat/board';
import { VideoPlayer } from '@/components/video-player';
import { ControlItem } from '@/components/control-item';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { NavController } from '@/components/nav';
import NativeSharedWindow from '@/components/native-shared-window';
import { DeviceDetectController } from '../device-detect';
import { AutoplayToast } from '@/components/autoplay-toast';
import { useBreakoutRoomStore, useUIStore, useAppStore } from '@/hooks';
import { Loading } from '@/components/loading';
import { observer } from 'mobx-react';
import { t } from '@/i18n';
import { BreakoutRoomBoard } from './components/breakout-chat-board';

import './breakout-class.scss';
import { BizLogger } from '@/utils/biz-logger';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

const BackButton = () => {

  const history = useHistory()

  const breakoutRoomStore = useBreakoutRoomStore()

  const handleClick = async () => {
    await breakoutRoomStore.leaveCourse()
    history.push('/breakout-class/assistant/courses')
  }

  return (
    <div className="back-button">
      {/* <div className="item">{'<'}</div> */}
      <div className="item" onClick={handleClick}>
        返回
      </div>
    </div>
  )
}

export const BreakoutClass = observer(() => {

  const breakoutRoomStore = useBreakoutRoomStore()

  const {
    mutedChat,
    muteControl,
    teacherStream: teacher,
    studentStreams,
    roomInfo,
  } = breakoutRoomStore

  const [chat, setChat] = useState<string>('')

  const sendMessage = async () => {
    await breakoutRoomStore.sendMessage(chat)
    setChat('')
  }

  const handleMute = async () => {
    if (mutedChat) {
      await breakoutRoomStore.unmuteChat()
    } else {
      await breakoutRoomStore.muteChat()
    }
  }

  return (
    <div className="super-small-class room-container">
      <div className="room-container">
        <div className="live-container">
          <div className="biz-container">
            {breakoutRoomStore.roomInfo.userRole === EduRoleTypeEnum.assistant && <BackButton />}
            <NetlessBoard />
            <ScreenSharing />
          </div>
          <div className="super-container">
            <div className="small-video">
              {studentStreams.map((studentStream: any, key: number) => (
                <VideoPlayer
                  key={key}
                  showClose={false}
                  role="student"
                  {...studentStream}
                  handleClickAudio={async (userUuid: string, isLocal: boolean) => {
                    if (studentStream.audio) {
                      await breakoutRoomStore.muteStudentAudio(userUuid, isLocal)
                    } else {
                      await breakoutRoomStore.unmuteStudentAudio(userUuid, isLocal)
                    }
                  }}
                  handleClickVideo={async (userUuid: string, isLocal: boolean) => {
                    if (studentStream.video) {
                      await breakoutRoomStore.muteStudentVideo(userUuid, isLocal)
                    } else {
                      await breakoutRoomStore.unmuteStudentVideo(userUuid, isLocal)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="live-board">
        <div className="video-board">
          <VideoPlayer
            role="teacher"
            showClose={false}
            {...teacher}
            handleClickAudio={async (userUuid: string, isLocal: boolean) => {
              if (teacher.audio) {
                await breakoutRoomStore.muteAudio(userUuid, isLocal, EduRoleTypeEnum.teacher)
              } else {
                await breakoutRoomStore.unmuteAudio(userUuid, isLocal, EduRoleTypeEnum.teacher)
              }
            }}
            handleClickVideo={async (userUuid: string, isLocal: boolean) => {
              if (teacher.video) {
                await breakoutRoomStore.muteVideo(userUuid, isLocal, EduRoleTypeEnum.teacher)
              } else {
                await breakoutRoomStore.unmuteVideo(userUuid, isLocal, EduRoleTypeEnum.teacher)
              }
            }}
          />
        </div>
        <BreakoutRoomBoard />
      </div>
    </div>
  )
})

export const roomTypes = [
  { value: 0, path: 'one-to-one' },
  { value: 1, path: 'small-class' },
  { value: 2, path: 'big-class' },
  { value: 3, path: 'breakout-class' },
  { value: 4, path: 'middle-class' },
];

function getIpc() {
  return window.ipc
}

export const BreakoutRoomController = observer(({ children }: any) => {
  // useEffect(() => {
  //   const ipc = getIpc()
  //   if (ipc && ipc.send) {
  //     ipc.send('resize-window', { width: 990, height: 706 });
  //   }
  //   return () => {
  //     const ipc = getIpc()
  //     if (ipc && ipc.send) {
  //       ipc.send('resize-window', { width: 700, height: 500 });
  //     }
  //   }
  // }, [getIpc])

  const uiStore = useUIStore()

  const location = useLocation()

  const breakoutRoomStore = useBreakoutRoomStore()

  const appStore = useAppStore()

  const history = useHistory()

  //@ts-ignore
  const {course_name} = useParams()

  BizLogger.info('params', course_name)

  useEffect(() => {
    if (!appStore.userRole) {
      history.push('/')
      return
    }

    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = (evt: any) => {
      BizLogger.info('popstate', evt)
      window.history.pushState(null, document.title, null);
      if (breakoutRoomStore.roomInfo.userRole === EduRoleTypeEnum.assistant) {
        if (breakoutRoomStore.joinedGroup && !uiStore.hasDialog('exitRoom')) {
          uiStore.showDialog({
            type: 'exitRoom',
            message: t('icon.exit-room'),
          })
        }
      } else {
        if (breakoutRoomStore.joined && !uiStore.hasDialog('exitRoom')) {
          uiStore.showDialog({
            type: 'exitRoom',
            message: t('icon.exit-room'),
          })
        }
      }
    }
    // window.addEventListener('popstate', handlePopState, false)

    if (!course_name) {
      breakoutRoomStore.join().then(() => {
        uiStore.addToast(t('toast.successfully_joined_the_room'))
      }).catch((err) => {
        BizLogger.warn(err.message)
        uiStore.addToast(t('toast.failed_to_join_the_room') + `${JSON.stringify(err.message)}`)
      })
    }
    if (course_name) {
      breakoutRoomStore.assistantJoinRoom(course_name).then(() => {
        uiStore.addToast(t('toast.successfully_joined_the_room'))
      }).catch((err) => {
        BizLogger.warn(err.message)
        uiStore.addToast(t('toast.failed_to_join_the_room') + `${JSON.stringify(err.message)}`)
      })
    }

    return () => {
      // window.removeEventListener('popstate', handlePopState, false)
    }
  }, [])

  return (
    <div className={`classroom breakout-class`}>
      {uiStore.loading ? <Loading /> : null}
      <AutoplayToast />
      <DeviceDetectController />
      <NativeSharedWindow />
      <NavController />
      {children}
    </div>
  );
})

export const BreakoutClassroom = () => {
  return (
    <BreakoutRoomController>
      <BreakoutClass />
    </BreakoutRoomController>
  )
}