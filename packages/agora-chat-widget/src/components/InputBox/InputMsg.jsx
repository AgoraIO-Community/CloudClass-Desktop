import { Input, message, Modal, Popover, Radio, Switch } from 'antd';
import classnames from 'classnames';
import React, { useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { transI18n } from '~components/i18n';
import { MSG_TYPE } from '../../contants';
import { messageAction } from '../../redux/actions/messageAction';
import { setQuestioinStateAction } from '../../redux/actions/roomAction';
import imgIcon from '../../themes/img/img.png';
import screenshotIcon from '../../themes/img/screenshot.png';
import emojiIcon from '../../themes/img/emoji.png';
import { Emoji } from '../../utils/emoji';
import isElctronPlatform from '../../utils/platform';
import { Button } from '../Button';
import './index.css';
import ScreenshotMenu from './Screenshot';

// 展示表情
export const ShowEomji = ({ getEmoji }) => {
  return (
    <div className="fcr-hx-emoji-container">
      {Emoji.map((emoji, key) => {
        return (
          <span
            className="fcr-hx-emoji-content"
            key={key}
            onClick={(e) => {
              getEmoji(e);
            }}>
            {emoji}
          </span>
        );
      })}
    </div>
  );
};

export const InputMsg = ({ allMutePermission }) => {
  const state = useSelector((state) => state);
  const store = useStore();
  const { apis } = state;
  const loginUser = state?.propsData.userUuid;
  const roomId = state?.room.info.id;
  const roleType = state?.propsData.roleType;
  const roomUuid = state?.propsData.roomUuid;
  const userNickName = state?.propsData.userName;
  const userAvatarUrl = state?.loginUserInfo.avatarurl;
  const isAllMute = state?.room.allMute;
  const isQuestion = state?.isQuestion;
  const configUIVisible = state?.configUIVisible;
  let isElectron = isElctronPlatform();

  // 管理输入框内容
  const [content, setContent] = useState('');
  // 输入框焦点
  const inputRef = useRef(null);

  const [inputStatus, setInputStatus] = useState(false);

  // 隐藏表情框
  const handleCancel = () => {
    Modal.destroyAll();
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
      apis.muteAPI.setAllmute(roomId);
    } else {
      apis.muteAPI.removeAllmute(roomId);
    }
  };

  // 监听输入框变化
  const changeMsg = (e) => {
    let msgContent = e.target.value;
    setContent(msgContent);
  };

  // 切换提问状态
  const toggleQuestionState = () => {
    store.dispatch(setQuestioinStateAction(!isQuestion));
  };

  const couterRef = useRef();
  const updateImage = () => {
    couterRef.current.focus();
    couterRef.current.click();
  };

  // 发送消息
  const sendTextMessage = () => (e) => {
    e.preventDefault();
    // 消息为空不发送
    if (content.match(/^\s*$/)) {
      message.error(transI18n('chat.enter_content_is_empty'));
      return;
    }
    let id = window.WebIM.conn.getUniqueId(); // 生成本地消息id
    let msg = new window.WebIM.message('txt', id); // 创建文本消息
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
        isQuestion: isQuestion,
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
    window.WebIM.conn.send(msg.body);
    setInputStatus(false);
    store.dispatch(setQuestioinStateAction(false));
    inputRef.current.blur();
  };

  const handleTextareFoucs = () => {
    setInputStatus(true);
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
          className={classnames('fcr-hx-input-chat', { 'input-chating-status': inputStatus })}
          onChange={(e) => changeMsg(e)}
          onFocus={handleTextareFoucs}
          value={content}
          onPressEnter={sendTextMessage()}
          ref={inputRef}
        />
      );
    }
  }, [configUIVisible.inputBox, content, inputStatus, isQuestion]);

  return (
    <>
      <div>
        <div className="fcr-hx-chat-icon">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {configUIVisible.emoji && (
              <Popover
                overlayClassName="chat-icon-popover"
                content={<ShowEomji getEmoji={getEmoji} />}
                trigger="click">
                <img src={emojiIcon} className="fcr-hx-emoji-icon" />
              </Popover>
            )}
            {configUIVisible.screenshotIcon && (
              <div onClick={updateImage} className="fcr-hx-chat-tool-item">
                <img src={imgIcon} alt="" className="fcr-hx-emoji-icon" />
                <input
                  id="uploadImage"
                  onChange={() => {
                    apis.messageAPI.sendImgMsg(couterRef);
                  }}
                  type="file"
                  ref={couterRef}
                  style={{
                    display: 'none',
                  }}
                />
              </div>
            )}
            {configUIVisible.screenshotIcon && isElectron && (
              <Popover
                content={<ScreenshotMenu couterRef={couterRef} />}
                className="fcr-hx-emoji-modal">
                <img src={screenshotIcon} className="fcr-hx-emoji-icon" alt="" />
              </Popover>
            )}
            {configUIVisible.showQuestionBox && (
              <div className="chat-question-container" onClick={toggleQuestionState}>
                <Radio checked={isQuestion}>
                  <div
                    className={
                      isQuestion ? 'fcr-hx-question-text question-selected' : 'fcr-hx-question-text'
                    }>
                    {transI18n('question')}
                  </div>
                </Radio>
              </div>
            )}
          </div>
          {!configUIVisible.allMute
            ? null
            : allMutePermission && (
                <div>
                  <span className="fcr-hx-all-mute-text">{transI18n('chat.all_mute')}</span>
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
          <Button type="primary" className="fcr-hx-send-btn" onClick={sendTextMessage()}>
            {transI18n('chat.send')}
          </Button>
        )}
      </div>
    </>
  );
};
