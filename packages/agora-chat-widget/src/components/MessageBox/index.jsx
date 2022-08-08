import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { transI18n } from '~components/i18n';
import { TextMsg } from './TextMsg';
import { CmdMsg } from './CmdMsg';
import { ImgMsg } from './ImgMsg';
import scrollElementToBottom from '../../utils/scrollElementToBottom';
import { CHAT_TABS_KEYS } from '../../contants';
import noMessage_icon from '../../themes/img/noMessage.png';
import './index.css';

// 聊天页面
export const MessageBox = () => {
  const state = useSelector((state) => state);
  const msgs = state?.messages;
  const isTabKey = state?.isTabKey;
  const isHaveNotice = state?.room?.announcement;
  let isHaveMsg = msgs && msgs.length > 0;

  const activeTab = isTabKey === CHAT_TABS_KEYS.chat;
  useEffect(() => {
    autoLastMsg();
  }, [msgs, activeTab]);

  // 消息自动加载最后一条消息
  const autoLastMsg = () => {
    let scrollElement = document.getElementById('chat-messages');
    scrollElementToBottom(scrollElement);
  };

  return (
    <>
      {isHaveMsg ? (
        <div
          className="fcr-hx-message-box"
          id="chat-messages"
          style={{
            height: isHaveNotice
              ? `calc(100% - 70px - ${
                  state?.configUIVisible.inputBox === 'inline' ? '135px' : '200px'
                })`
              : `calc(100% - 70px - ${
                  state?.configUIVisible.inputBox === 'inline' ? '102px' : '158px'
                })`,
          }}>
          <div>
            {msgs &&
              msgs.map((item, key) => {
                const isText = item?.contentsType === 'TEXT' || item?.type === 'txt';
                const isCmd = item?.contentsType === 'COMMAND' || item?.type === 'cmd';
                const isImg = item?.contentsType === 'IMAGE' || item?.type === 'img';
                return (
                  <div key={key}>
                    {isText && <TextMsg item={item} />}
                    {isCmd && <CmdMsg item={item} />}
                    {isImg && <ImgMsg item={item} />}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div
            className="fcr-hx-message-box fcr-hx-no-box"
          style={{
            height: isHaveNotice
              ? `calc(100% - 70px - ${
                  state?.configUIVisible.inputBox === 'inline' ? '135px' : '200px'
                })`
              : `calc(100% - 70px - ${
                  state?.configUIVisible.inputBox === 'inline' ? '102px' : '158px'
                })`,
          }}>
            <div className="fcr-hx-no-msgs">
            <img src={noMessage_icon} />
            <span className="fcr-hx-no-msgs-text">{transI18n('chat.no_message')}</span>
          </div>
        </div>
      )}
    </>
  );
};
