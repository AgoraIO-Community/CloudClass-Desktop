import websdk from 'agora-chat';
import config from './WebIMConfig';

export const initIMSDK = (appkey) => {
  let WebIM = window.WebIM || {};
  WebIM.config = config;
  WebIM.config.appkey = appkey;
  if (WebIM.conn) {
    WebIM.conn.close();
  }

  let options = {
    isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
    isDebug: WebIM.config.isDebug,
    https: WebIM.config.https,
    isAutoLogin: false,
    heartBeatWait: WebIM.config.heartBeatWait,
    autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
    delivery: WebIM.config.delivery,
    appKey: appkey,
    useOwnUploadFun: WebIM.config.useOwnUploadFun,
    deviceId: WebIM.config.deviceId,
    //公有云 isHttpDNS 默认配置为true
    isHttpDNS: WebIM.config.isHttpDNS,
  };

  WebIM.conn = new websdk.connection(options);
};

export default window.WebIM;
