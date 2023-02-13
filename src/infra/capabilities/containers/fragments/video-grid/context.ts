import AgoraRtcEngine from 'agora-electron-sdk/types/Api';
import { createContext } from 'react';

export const RtcEngineContext = createContext<{
  rtcEngine?: AgoraRtcEngine;
}>({});
