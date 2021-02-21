import React, { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {NavController} from '@/components/nav';
import NativeSharedWindow from '@/components/native-shared-window';
import { DeviceDetectController } from '../device-detect';
import { AutoplayToast } from '@/components/autoplay-toast';
import { useMiddleRoomStore, useUIStore, useAppStore } from '@/hooks';
import { Loading } from '@/components/loading';
import { observer } from 'mobx-react';
import { t } from '@/i18n';
import { BizLogger } from '@/utils/biz-logger';
import { MiddleClass } from './middle-class';

export const roomTypes = [
  {value: 0, path: 'one-to-one'},
  {value: 1, path: 'small-class'},
  {value: 2, path: 'big-class'},
  {value: 3, path: 'breakout-class'},
  {value: 4, path: 'middle-class'},
];

function getIpc() {
  return window.ipc
}

const RoomController = observer(({children}: any) => {
  // useEffect(() => {
  //   const ipc = getIpc()
  //   if (ipc && ipc.send) {
  //     ipc.send('resize-window', {width: 990, height: 706});
  //   }
  //   return () => {
  //     const ipc = getIpc()
  //     if (ipc && ipc.send) {
  //       ipc.send('resize-window', {width: 700, height: 500});
  //     }
  //   }
  // }, [getIpc])

  const uiStore = useUIStore()

  const location = useLocation()

  const middleRoomStore = useMiddleRoomStore()

  const appStore = useAppStore()

  const history = useHistory()

  useEffect(() => {
    if (middleRoomStore.quit) {
      middleRoomStore.leave().then(
        () => {
          uiStore.unblock()
          history.replace('/')
        }
      ).catch(BizLogger.warn)
    }
  }, [middleRoomStore.quit, history, uiStore.unblock])

  useEffect(() => {
    if (!appStore.userRole) {
      history.push('/')
      return
    }

    let pathList = location.pathname.split('/')
    let path = pathList[pathList.length - 1]

    middleRoomStore.join().then(() => {
      uiStore.addToast(t('toast.successfully_joined_the_room'))
      
    }).catch((err) => {
      BizLogger.warn(err.message)
      uiStore.addToast(t('toast.failed_to_join_the_room') + `${JSON.stringify(err.message)}`)
    })
  }, [])
  
  let pathList = location.pathname.split('/')
  let path = pathList[pathList.length - 1]
  const index = roomTypes.findIndex((it: any) => path === it.path)

  const value = roomTypes[index].path
  
  return (
    <div className={`classroom ${value}`}>
      {uiStore.loading ? <Loading /> : null}
      <AutoplayToast />
      <DeviceDetectController />
      <NativeSharedWindow />
      <NavController />
      {children}
    </div>
  );
})

export const MiddleRoomPage = () => (
  <RoomController>
    <MiddleClass />
  </RoomController>
)

