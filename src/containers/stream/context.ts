import { EduStreamUI } from '@classroom/uistores/stream/struct';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { createContext } from 'react';
export const StreamContext = createContext<ReturnType<typeof convertStreamUIStatus> | null>(null);
interface StreamMouseContext {
  mouseEnter: boolean;
  mouseEnterClass: boolean;
}
export const StreamMouseContext = createContext<StreamMouseContext | null>(null);
export const convertStreamUIStatus = (stream: EduStreamUI) => {
  const isVideoStreamPublished = stream.isVideoStreamPublished;
  const isHostStream = stream.role === EduRoleTypeEnum.teacher;
  return {
    streamPlayerVisible: isVideoStreamPublished,
    stream,
    isHostStream,
  };
};
export const StreamToolContext = createContext<ReturnType<typeof streamTool> | null>(null);
export const streamTool = (currentRef: any, toolVisible: boolean, showTool?: () => void) => {
  return {
    // stream,
    currentRef,
    toolVisible,
    showTool,
  };
};
