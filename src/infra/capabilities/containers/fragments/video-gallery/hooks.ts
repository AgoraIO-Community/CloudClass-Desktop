import { WindowID } from '@classroom/infra/api';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import {
  listenChannelMessage,
  receiveRTCRawData,
  sendToRendererProcess,
} from '@classroom/infra/utils/ipc';
import { ChannelType, IPCMessageType } from '@classroom/infra/utils/ipc-channels';
import AgoraRtcEngine from 'agora-electron-sdk/types/Api';
import { Logger } from 'agora-rte-sdk';
import { useCallback, useEffect, useState } from 'react';

type VideoGalleryState = {
  options: { text: string; value: number }[];
  pageSize: number;
  curPage: number;
  totalPageNum: number;
  streamList: EduStreamUI[];
  stageUserUuids: string[];
};

export const updateVideoGalleryState = (payload: Partial<VideoGalleryState>) => {
  sendToRendererProcess(WindowID.Main, ChannelType.Message, {
    type: IPCMessageType.UpdateVideoGalleryState,
    payload,
  });
};

export const clickStage = (type: 'on' | 'off', userUuid: string) => {
  sendToRendererProcess(WindowID.Main, ChannelType.Message, {
    type: IPCMessageType.InviteStage,
    payload: { type, userUuid },
  });
};

export const useRtcEngine = () => {
  const [rtcEngine] = useState<AgoraRtcEngine>(
    () => new (window.require('agora-electron-sdk').default)() as AgoraRtcEngine,
  );

  useEffect(() => {
    const rtcRawDataEventDisposer = receiveRTCRawData((e, payload) => {
      //@ts-ignore
      rtcEngine.onRegisterDeliverFrame(payload);
    });

    return rtcRawDataEventDisposer;
  }, [rtcEngine]);

  return { rtcEngine };
};

export const useVideoGalleryState = () => {
  const [
    { options, pageSize, curPage, totalPageNum, streamList, stageUserUuids },
    setVideoGalleryState,
  ] = useState<VideoGalleryState>({
    options: [],
    pageSize: 0,
    curPage: 0,
    totalPageNum: 0,
    streamList: [],
    stageUserUuids: [],
  });

  useEffect(() => {
    const dispose = listenChannelMessage(ChannelType.Message, (_e, message) => {
      if (message.type === IPCMessageType.VideoGalleryStateUpdated) {
        Logger.info('video grid state updated', message.payload);
        setVideoGalleryState(message.payload as VideoGalleryState);
      }
    });
    Logger.info('fetch video grid state');
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: IPCMessageType.FetchVideoGalleryState,
    });

    return dispose;
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    updateVideoGalleryState({
      pageSize,
    });
  }, []);
  const nextPage = useCallback(() => {
    updateVideoGalleryState({
      curPage: curPage + 1,
    });
  }, [curPage]);
  const prevPage = useCallback(() => {
    updateVideoGalleryState({
      curPage: curPage - 1,
    });
  }, [curPage]);

  const onStage = useCallback((userUuid: string) => {
    clickStage('on', userUuid);
  }, []);
  const offStage = useCallback((userUuid: string) => {
    clickStage('off', userUuid);
  }, []);

  return {
    options,
    pageSize,
    curPage,
    totalPageNum,
    setPageSize,
    nextPage,
    prevPage,
    streamList,
    stageUserUuids,
    onStage,
    offStage,
  };
};
