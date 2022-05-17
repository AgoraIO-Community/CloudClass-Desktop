import { AgoraRteEngineConfig, AgoraRteRuntimePlatform, Logger } from 'agora-rte-sdk';
import uuid from 'uuid';
import { WindowID } from '../api';
import type { IpcRendererEvent } from 'electron';

type IPCResponse = {
  code: number;
  message: string;
  data?: unknown;
};

type ChannelMessage = {
  type: string;
  payload?: unknown;
};

type ChannelMessageCallback = (event: IpcRendererEvent, message: ChannelMessage) => void;
type ChannelMessageListenerOptions = {
  once?: boolean;
};

export enum ChannelType {
  OpenBrowserWindow = 'open-browser-window',
  CloseBrowserWindow = 'close-browser-window',
  ShowBrowserWindow = 'show-browser-window',
  HideBrowserWindow = 'hide-browser-window',
  Message = 'browser-window-message',
  UpdateBrowserWindow = 'update-browser-window',
  MoveWindowToTargetScreen = 'move-window-to-target-screen',
}

const withTimeout = (p: Promise<unknown>, timeout = 3000) =>
  Promise.race([
    p,
    new Promise((_, reject) => {
      setTimeout(reject, timeout);
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
          Logger.error('IPC call failed');
          reject();
        }
      };

      try {
        ipc.once(replyChannelName, replyCallback);

        Logger.info('send to main process', channel, args);

        ipc.send(channel, replyChannelName, ...args);
      } catch (e) {
        Logger.error('failed to call IPC', e);
        reject();
      }
    } else {
      Logger.error('IPC cannot call in browser');
      reject();
    }
  });

  return withTimeout(p);
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
    args: [message],
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
  if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
    const _callback = (event: IpcRendererEvent, args: unknown[]) => {
      const message = args[0] as ChannelMessage;
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
  } else {
    Logger.warn('cannot listen to IPC in browser, ignore');
  }
  //   dispose
  return () => {
    if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
      const ipc = window.require('electron').ipcRenderer;
      ipc.off(channel, callback);
    }
  };
};
