import React, { useEffect } from 'react';
import { useHistory, useLocation, } from 'react-router-dom';
import { useAppStore } from '@/hooks';
import { homeApi } from '@/services/home-api';
import { UIStore } from '@/stores/app';
import { observer } from 'mobx-react';

export const Invisible = observer((props: any) => {
  const appStore = useAppStore();
  const history = useHistory();
  const roomTypes = UIStore.roomTypes
  const { search } = useLocation()
  const setRoomInfo = async () => {
    const params: any = new URLSearchParams(search)
    const userUuid = params.get('userUuid');
    const userRole = params.get('userRole') || 0;
    const roomType = params.get('roomType') || 0;
    const roomUuid = params.get('roomUuid');
    const roomName = params.get('roomName')||'audience';
    const uid = `audience${userRole}`
    const { rtmToken } = await homeApi.login(uid)
    appStore.setRoomInfo({
      rtmUid: userUuid,
      rtmToken,
      roomType,
      roomName,
      userName: 'audience',
      userRole: userRole,
      userUuid: `${userUuid}`,
      roomUuid: `${roomUuid}`,
    })
    const path = roomType ? roomTypes[roomType].path : '/acadsoc/one-to-one'
    history.push(`${path}`)
  }
  useEffect(() => {
    setRoomInfo()
  }, []);
  return (<div />)
})