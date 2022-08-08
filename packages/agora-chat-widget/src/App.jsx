import { useEffect, useMemo, useRef } from 'react';
import i18n from 'i18next';
import { useSelector, useStore } from 'react-redux';
import { initIMSDK } from './utils/WebIM';
import {
  propsAction,
  isShowChat,
  isShowMiniIcon,
  setAgoraTokenConfig,
} from './redux/actions/propsAction';
import { showRedNotification } from './redux/actions/messageAction';
import { setVisibleUI } from './redux/actions/roomAction';
import { Chat } from './components/Chat';
import { SvgIconEnum, SvgImg } from '~components/svg-img';
import im_CN from './locales/zh_CN';
import im_US from './locales/en_US';
import { createListener } from './utils/listeners';
import './App.css';
import 'antd/dist/antd.css';

const App = function (props) {
  const store = useStore();
  // 白板全屏状态下，控制IMChat
  const {
    showChat: globalShowChat,
    isShowMiniIcon: miniIconStatus,
    configUIVisible: config,
  } = props.pluginStore.globalContext;

  // get token config
  const { agoraTokenData } = props;

  const state = useSelector((state) => state);
  const apis = state?.apis;
  const showChat = state?.showChat;
  const showRed = state?.showRed;
  const showAnnouncementNotice = state?.showAnnouncementNotice;
  const configUIVisible = state?.configUIVisible;
  const { createListen } = useMemo(() => {
    return createListener(store);
  }, [store]);

  useEffect(() => {
    store.dispatch(isShowChat(globalShowChat));
    store.dispatch(isShowMiniIcon(miniIconStatus));
    store.dispatch(setVisibleUI(config));
    store.dispatch(setAgoraTokenConfig(agoraTokenData));
    i18n.addResourceBundle('zh', 'translation', im_CN);
    i18n.addResourceBundle('en', 'translation', im_US);
  }, []);

  const loggedIn = useRef();

  // 最小化窗口设置
  const onChangeModal = () => {
    store.dispatch(isShowChat(true));
    store.dispatch(showRedNotification(false));
  };

  useEffect(() => {
    const propsData = { ...props.pluginStore.context };

    const { orgName, appName, chatRoomId, userUuid } = propsData;

    if (orgName && appName && chatRoomId && userUuid && !loggedIn.current && apis) {
      loggedIn.current = true;

      const appkey = orgName + '#' + appName;

      store.dispatch(propsAction(propsData));

      initIMSDK(appkey);

      createListen(propsData, appkey);

      apis.loginAPI.loginWithToken(appkey, userUuid);
    }
  }, [props.pluginStore, createListen, store, apis]);

  return (
    <>
      {showChat ? (
        <div
          className="fcr-hx-app w-full"
          style={{
            width: configUIVisible.isFullSize ? '100%' : '300px',
            height: configUIVisible.isFullSize ? '100%' : '530px',
          }}>
          <Chat />
        </div>
      ) : (
          <div className="fcr-hx-chat">
          <div
              className="fcr-hx-show-chat-icon"
            onClick={() => {
              // 展开聊天
              onChangeModal();
            }}>
            {/* <img src={showChat_icon} width="24" height="24" /> */}
            <SvgImg type={SvgIconEnum.CHAT} />
              {(showRed || showAnnouncementNotice) && <div className="fcr-hx-chat-notice"></div>}
          </div>
        </div>
      )}
    </>
  );
};
export default App;
