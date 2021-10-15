import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { transI18n } from '~ui-kit';
import { TextMsg } from './TextMsg';
import { CmdMsg } from './CmdMsg';
import scrollElementToBottom from '../../utils/scrollElementToBottom';
import { CHAT_TABS_KEYS } from '../../contants';
import noMessage_icon from '../../themes/img/noMessage.png';
import toBottom_icon from '../../themes/img/toBottom.png';
import './index.css';

// 聊天页面
export const MessageBox = () => {
  // 控制新消息提示
  const [hideMsgTips, setHideMsgTips] = useState(false);
  const state = useSelector((state) => state);
  // 当前登陆ID
  const loginUser = state?.loginUser;
  const msgs = state?.messages;
  const isTabKey = state?.isTabKey;
  const isHaveNotice = state?.room?.announcement;
  let isHaveMsg = msgs && msgs.length > 0;
  const activeTab = isTabKey === CHAT_TABS_KEYS.chat;
  // 整个messagebox框
  let scrollElement;
  // 是否触底
  let isBottom;
  // 判断是否为自己发送的消息
  let isMySelf;
  // 最后一个msg div 高度
  let msgScrollElementHeight;
  useEffect(() => {
    scrollElement = document.getElementById('chat-messages');
    msgScrollElementHeight = document.getElementById(msgs[msgs.length - 1]?.id)?.scrollHeight;
    onScrollHandle();
    if (isBottom) {
      autoLastMsg();
    } else {
      // 没有触底，并是自己发的消息，直接跳到底部
      if (isMySelf) {
        autoLastMsg();
        return;
      }
      if (scrollElement?.scrollHeight > scrollElement?.scrollTop) {
        setHideMsgTips(true);
      }
    }
  }, [msgs]);

  // // 切换tab 直接展示最新消息
  // useEffect(() => {
  //   autoLastMsg()
  // }, [activeTab])

  // 消息自动加载最后一条消息
  const autoLastMsg = () => {
    scrollElement = document.getElementById('chat-messages');
    msgScrollElementHeight = document.getElementById(msgs[msgs.length - 1]?.id)?.scrollHeight;
    scrollElementToBottom(scrollElement);
    setHideMsgTips(false);
  };

  // 判断当前是否触底
  const onScrollHandle = () => {
    // 页面展示高度
    let nDivHight = scrollElement?.offsetHeight;
    // 总高度
    let nScrollHight = scrollElement?.scrollHeight;
    // 当前展示位置
    let nScrollTop = scrollElement?.scrollTop;
    return (isBottom = nScrollTop + nDivHight + msgScrollElementHeight >= nScrollHight);
  };

  // 滚动触底事件
  const scrool = (e) => {
    let height = e?.target?.offsetHeight;
    let topHeight = e?.target?.scrollTop;
    let scrollHight = e?.target?.scrollHeight;
    if (topHeight + height >= scrollHight) {
      setHideMsgTips(false);
    }
  };

  return (
    <div>
      {isHaveMsg ? (
        <div
          className="message-box"
          id="chat-messages"
          style={{
            height: isHaveNotice ? 'calc(100% - 200px)' : 'calc(100% - 178px)',
          }}
          onScroll={scrool}>
          <div>
            {msgs &&
              msgs.map((item, key) => {
                const isText = item?.contentsType === 'TEXT' || item?.type === 'txt';
                const isCmd = item?.contentsType === 'COMMAND' || item?.type === 'cmd';
                isMySelf = item?.from === loginUser;
                return (
                  <div key={key} style={{ padding: '0 5px 25px 0' }} id={item.id}>
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
            height: isHaveNotice ? 'calc(100% - 200px)' : 'calc(100% - 178px)',
          }}>
          <div className="no-msgs">
            <img src={noMessage_icon} />
            <span className="no-msgs-text">{transI18n('chat.no_message')}</span>
          </div>
        </div>
      )}
      {/* 展示新消息提示 */}
      {hideMsgTips && (
        <div
          className="new-msg-tips"
          onClick={() => {
            autoLastMsg();
          }}>
          <img src={toBottom_icon} />
          <span className="new-msg-tips-text">{transI18n('chat.have_new_msgs')}</span>
        </div>
      )}
    </div>
  );
};
