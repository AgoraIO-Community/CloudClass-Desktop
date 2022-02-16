import { Input, message, Modal, Switch, Popover } from 'antd';
import { Button } from '../Button';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { transI18n } from '~ui-kit';
import { removeAllmute, setAllmute } from '../../api/mute';
import { MSG_TYPE } from '../../contants';
import { messageAction, showEmojiAction } from '../../redux/actions/messageAction';
import store from '../../redux/store';
// import emojiIcon from '../../themes/img/emoji.png';
import emojiIcon from '../../themes/svg/emoji.svg';
import { Emoji } from '../../utils/emoji';
import './index.css';

// 展示表情
export const ShowEomji = ({ getEmoji }) => {
  return (
    <div className="emoji-container">
      {Emoji.map((emoji, key) => {
        return (
          <span className="emoji-content" key={key} onClick={getEmoji}>
            {emoji}
          </span>
        );
      })}
    </div>
  );
};

export const InputMsg = ({ allMutePermission }) => {
  const state = useSelector((state) => state);
  const loginUser = state?.propsData.userUuid;
  const roomId = state?.room.info.id;
  const roleType = state?.propsData.roleType;
  const roomUuid = state?.propsData.roomUuid;
  const userAvatarUrl = state?.loginUserInfo.avatarurl;
  const userNickName = state?.propsData.userName;
  const isAllMute = state?.room.allMute;
  const isShowEmoji = state?.showEmoji;
  const configUIVisible = state?.configUIVisible;

  // 管理输入框内容
  const [content, setContent] = useState('');
  // 输入框焦点
  const inputRef = useRef(null);

  const [inputStatus, setInputStatus] = useState(false);

  // 显示表情框
  const showEmoji = () => {
    store.dispatch(showEmojiAction(true));
  };
  // 隐藏表情框
  const handleCancel = () => {
    Modal.destroyAll();
    store.dispatch(showEmojiAction(false));
  };

  // 获取到点击的表情，加入到输入框
  const getEmoji = (e) => {
    e.preventDefault();
    // 监听表情输入后，自动获取输入框焦点
    inputRef.current.focus({
      cursor: 'end',
    });
    // 本次输入的内容
    let tempContent = e.target.innerText;
    // 更新内容和长度
    let totalContent = content + tempContent;
    setContent(totalContent);
  };

  // 全局禁言开关
  const onChangeMute = (val) => {
    if (!val) {
      setAllmute(roomId);
    } else {
      removeAllmute(roomId);
    }
  };

  // 监听输入框变化
  const changeMsg = (e) => {
    let msgContent = e.target.value;
    setContent(msgContent);
  };

  // 发送消息
  const sendTextMessage = () => (e) => {
    e.preventDefault();
    // 消息为空不发送
    if (content.match(/^\s*$/)) {
      message.error(transI18n('chat.enter_content_is_empty'));
      return;
    }
    let id = WebIM.conn.getUniqueId(); // 生成本地消息id
    let msg = new WebIM.message('txt', id); // 创建文本消息
    let option = {
      msg: content, // 消息内容
      to: roomId, // 接收消息对象(聊天室id)
      from: loginUser,
      chatType: 'chatRoom', // 群聊类型设置为聊天室
      ext: {
        msgtype: MSG_TYPE.common, // 消息类型
        roomUuid: roomUuid,
        role: roleType,
        avatarUrl: userAvatarUrl || '',
        nickName: userNickName,
      }, // 扩展消息
      success: function (id, serverId) {
        handleCancel();
        msg.id = serverId;
        msg.body.id = serverId;
        msg.body.time = new Date().getTime().toString();
        store.dispatch(messageAction(msg.body, { isHistory: false }));
      }, // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
      fail: function (err) {
        console.log('fail>>>', err);
        if (err.type === 501) {
          message.error(transI18n('chat.message_incloud_illegal_content'));
        }
      },
    };
    msg.set(option);
    setContent('');
    WebIM.conn.send(msg.body);
    setInputStatus(false);
    inputRef.current.blur();
  };

  const handleTextareFoucs = () => {
    setInputStatus(true);
  };

  const handleEomijVisibleChange = (visible) => {
    store.dispatch(showEmojiAction(visible));
  };

  const renderInputBox = React.useMemo(() => {
    if (configUIVisible.inputBox === 'inline') {
      return (
        <Input
          className="inline-input-chat"
          bordered={false}
          ref={inputRef}
          placeholder={transI18n('chat.enter_contents')}
          onChange={(e) => changeMsg(e)}
          value={content}
          onPressEnter={sendTextMessage()}
          enterKeyHint="send"
        />
      );
    } else {
      return (
        <Input.TextArea
          placeholder={transI18n('chat.enter_contents')}
          className={classnames('input-chat', { 'input-chating-status': inputStatus })}
          onChange={(e) => changeMsg(e)}
          onFocus={handleTextareFoucs}
          value={content}
          onPressEnter={sendTextMessage()}
          ref={inputRef}
        />
      );
    }
  }, [configUIVisible.inputBox, content, inputStatus]);

  return (
    <>
      <div>
        <div className="chat-icon">
          {configUIVisible.emoji && (
            <Popover
              content={<ShowEomji getEmoji={getEmoji} />}
              visible={isShowEmoji}
              trigger="click"
              onVisibleChange={handleEomijVisibleChange}>
              <img src={emojiIcon} className="emoji-icon" onClick={showEmoji} />
            </Popover>
          )}
          {!configUIVisible.allMute
            ? null
            : allMutePermission && (
                <div>
                  <span className="all-mute-text">{transI18n('chat.all_mute')}</span>
                  <Switch
                    className="chat-switch"
                    checked={isAllMute}
                    onClick={() => {
                      onChangeMute(isAllMute);
                    }}
                  />
                </div>
              )}
        </div>
        {renderInputBox}
        {configUIVisible.btnSend && (
          <Button type="primary" className="send-btn" onClick={sendTextMessage()}>
            {transI18n('chat.send')}
          </Button>
        )}
      </div>
    </>
  );
};
