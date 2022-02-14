import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { transI18n } from '~ui-kit';
import { TextMsg } from './TextMsg';
import { CmdMsg } from './CmdMsg';
import scrollElementToBottom from '../../utils/scrollElementToBottom';
import { CHAT_TABS_KEYS, ROLE } from '../../contants';
import noMessage_icon from '../../themes/img/noMessage.png';
import './index.css';

// 聊天页面
export const MessageBox = ({ height }) => {
  const state = useSelector((state) => state);
  const msgs = state?.messages;
  const isTabKey = state?.isTabKey;
  const isHaveNotice = state?.room?.announcement;
  const roleType = state?.loginUserInfo.ext;
  // 在propsData 取值
  const isAudience = roleType && ROLE.audience.id.includes(JSON.parse(roleType).role);
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
          className="message-box"
          id="chat-messages"
          style={{
            height: height
              ? height
              : isHaveNotice
              ? `calc(100% - ${state?.configUIVisible.inputBox === 'inline' ? '135px' : '200px'})`
              : `calc(100% - ${state?.configUIVisible.inputBox === 'inline' ? '102px' : '158px'})`,
          }}>
          <div>
            {msgs &&
              msgs.map((item, key) => {
                const isText = item?.contentsType === 'TEXT' || item?.type === 'txt';
                const isCmd = item?.contentsType === 'COMMAND' || item?.type === 'cmd';
                return (
                  <div key={key}>
                    {isText && <TextMsg item={item} />}
                    {isCmd && <CmdMsg item={item} />}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div
          className="message-box no-box"
          style={{
            height: height
              ? height
              : isHaveNotice
              ? `calc(100% - ${state?.configUIVisible.inputBox === 'inline' ? '135px' : '200px'})`
              : `calc(100% - ${state?.configUIVisible.inputBox === 'inline' ? '102px' : '158px'})`,
          }}>
          <div className="no-msgs">
            <img src={noMessage_icon} />
            <span className="no-msgs-text">{transI18n('chat.no_message')}</span>
          </div>
        </div>
      )}
    </>
  );
};
