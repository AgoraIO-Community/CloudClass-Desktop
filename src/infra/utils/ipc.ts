import { AgoraRteEngineConfig, AgoraRteRuntimePlatform, Logger } from 'agora-rte-sdk';
import uuid from 'uuid';
import { WindowID } from '../api';
import type { IpcRendererEvent } from 'electron';
import { ChannelType } from './ipc-channels';

type IPCResponse = {
  code: number;
  message: string;
  data?: unknown;
};

type ChannelMessage = {
  type: string;
  payload?: unknown;
};

type ChannelMessageCallback = (
  event: IpcRendererEvent,
  message: ChannelMessage,
  ...args: any
) => void;

type ChannelMessageListenerOptions = {
  once?: boolean;
};

type RTCRawDataCallback = (event: IpcRendererEvent, payload: unknown) => void;

export const withTimeout = <T>(p: Promise<T>, detail: unknown, timeout = 5000) =>
  Promise.race([
    p,
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(`IPC timeout for ${timeout}ms, detail: ${JSON.stringify(detail)}`),
        timeout,
      );
    }),
  ]);

/**
 * 打开窗口
 * @param channel
 * @param args
 * @returns
 */
export const sendToMainProcess = async (channel: ChannelType, ...args: unknown[]) => {
  const p = new Promise((resolve, reject) => {
    if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
      const ipc = window.require('electron').ipcRenderer;

      const replyChannelName = `${channel}-reply-${uuid()}`;

      const replyCallback = (event: IpcRendererEvent, resp: IPCResponse) => {
        if (!resp.code) {
          resolve(resp.data);
        } else {
          reject(`failed IPC call returned with code: ${resp.code}`);
        }
      };

      try {
        ipc.once(replyChannelName, replyCallback);

        Logger.info('send to main process', channel, args);

        ipc.send(channel, replyChannelName, ...args);
      } catch (e) {
        reject(`failed to call IPC: ${(e as Error).message}`);
      }
    } else {
      reject('IPC cannot call in browser');
    }
  });

  let data = null;

  try {
    data = await withTimeout(p, { channel, args });
  } catch (e) {
    Logger.error(e);
  }
  return data;
};

/**
 * 发送消息到指定窗口
 * @param windowID
 * @param args
 * @returns
 */
export const sendToRendererProcess = async (
  windowID: WindowID,
  channel: ChannelType,
  message: ChannelMessage,
) => {
  return await sendToMainProcess(ChannelType.Message, {
    to: windowID,
    channel,
    args: message,
  });
};

/**
 * 监听主进程消息
 * @param channel
 * @param callback
 * @param options
 * @returns
 */
export const listenChannelMessage = (
  channel: ChannelType,
  callback: ChannelMessageCallback,
  options?: ChannelMessageListenerOptions,
) => {
  let _callback: (event: IpcRendererEvent, message: ChannelMessage) => void = () => {};
  if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
    _callback = (event: IpcRendererEvent, message: ChannelMessage) => {
      Logger.info(`receive channel message with type ${message.type} and payload`, message.payload);
      callback(event, message);
    };

    const ipc = window.require('electron').ipcRenderer;

    if (options?.once) {
      ipc.once(channel, _callback);
    } else {
      ipc.on(channel, _callback);
    }
    Logger.info(`listen to main process\' [${channel}] channel message`, channel);
  }
  //   dispose
  return () => {
    if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
      const ipc = window.require('electron').ipcRenderer;
      ipc.off(channel, _callback);
    }
  };
};

/**
 * RTC裸数据传输
 * @param windowID
 * @param payload
 */
export const transmitRTCRawData = (windowID: WindowID, payload: unknown) => {
  const ipc = window.require('electron').ipcRenderer;

  try {
    // this raw data will be forwarded thourgh renderer process > main process > renderer process.
    // data converting will occur in each forward, so we format the data to a json string before
    // transmit for reducing performance overhead
    ipc.send(ChannelType.RTCRawDataTransmit, windowID, payload);
  } catch (e) {
    Logger.error('failed to transmit over IPC', e);
  }
};

/**
 * 接收RTC裸数据
 * @param callback
 * @returns
 */
export const receiveRTCRawData = (callback: RTCRawDataCallback) => {
  const _callback = (event: IpcRendererEvent, payload: unknown) => {
    // this raw data will be forwarded thourgh renderer process > main process > renderer process.
    // data converting will occur in each forward, so we format the data to a json string before
    // transmit for reducing performance overhead
    callback(event, payload);
  };

  if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
    const ipc = window.require('electron').ipcRenderer;

    ipc.on(ChannelType.RTCRawDataTransmit, _callback);
  }
  //   dispose
  return () => {
    if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
      const ipc = window.require('electron').ipcRenderer;
      ipc.off(ChannelType.RTCRawDataTransmit, _callback);
    }
  };
};
