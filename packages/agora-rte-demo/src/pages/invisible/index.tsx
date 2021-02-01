import React, { useEffect } from 'react';
import { useHistory, useLocation, } from 'react-router-dom';
import { useRoomStore, useAppStore } from '@/hooks';
import { homeApi } from '@/services/home-api';
import { UIStore } from '@/stores/app';
import { observer } from 'mobx-react';
const parse = (query: string) => {
  let querystring = query;
  if (querystring.indexOf('?') > -1) {
    querystring = querystring.split('?')[1]
  }
  const list = querystring.split('&');
  const ret = {};

  list.forEach(function (item) {
    const slices = item.split('=');
    const key = slices[0];
    const val = slices[1];
    if (ret[key]) {
      ret[key] = Array.isArray(ret[key]) ? ret[key] : [ret[key]];
      ret[key].push(val);
    } else {
      ret[key] = val;
    }
  });

  return ret;
};



export const Invisible = observer((props: any) => {
  const appStore = useAppStore();
  const history = useHistory();
  const roomTypes = UIStore.roomTypes
  const { search } = useLocation()
  const setRoomInfo = async () => {
    const params: any = parse(search)
    const { userUuid, userRole = 0, roomType = 0, roomUuid, roomName = 'audience' } = params
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
    const path = roomTypes[roomType].path
    history.push(`/classroom/${path}`)
  }
  useEffect(() => {
    setRoomInfo()
  }, []);
  return (<div />)
})