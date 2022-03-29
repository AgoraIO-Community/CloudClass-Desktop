import { useSelector, useStore } from 'react-redux';
import { Tag, Menu, Dropdown } from 'antd';
import { ROLE, MSG_TYPE } from '../../contants';
import { transI18n } from '~ui-kit';
import { messageAction } from '../../redux/actions/messageAction';
import delete_icon from '../../themes/img/delete.png';
import './index.css';

// 聊天页面
export const TextMsg = ({ item }) => {
  const state = useSelector((state) => state);
  const store = useStore();
  const roomId = state?.room.info.id;
  const roomUuid = state?.propsData.roomUuid;
  const loginUser = state?.propsData.userUuid;
  const roleType = state?.propsData.roleType;
  const sender = item?.from === loginUser;
  const teacherTag = item?.ext.role === ROLE.teacher.id;
  const assistantTag = item?.ext.role === ROLE.assistant.id;
  const msgData = item?.msg || item?.data;
  const useAvatarUrl = item?.ext.avatarUrl;
  const userNickName = item?.ext.nickName;
  const loginNickName = state?.propsData.userName;
  const isTeacher =
    state.propsData.roleType === ROLE.teacher.id || state.propsData.roleType === ROLE.assistant.id;

  const isSendToAll = item?.ext.range === 3;
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <div style={{ display: 'flex' }} onClick={() => deleteMsg(item.id)}>
          <img src={delete_icon} />
          {transI18n('chat.delete')}
        </div>
      </Menu.Item>
    </Menu>
  );

  // 删除消息
  const deleteMsg = (recallId) => {
    var id = window.WebIM.conn.getUniqueId(); //生成本地消息id
    var msg = new window.WebIM.message('cmd', id); //创建命令消息
    msg.set({
      to: roomId, //接收消息对象
      action: 'DEL', //用户自定义，cmd消息必填
      chatType: 'chatRoom',
      from: loginUser,
      ext: {
        msgtype: MSG_TYPE.common, // 消息类型
        roomUuid: roomUuid,
        msgId: recallId,
        role: roleType,
        nickName: loginNickName,
      }, //用户自扩展的消息内容（群聊用法相同）
      success: function (id, serverId) {
        msg.id = serverId;
        msg.body.id = serverId;
        msg.body.time = new Date().getTime().toString();
        store.dispatch(messageAction(msg.body, { isHistory: false }));
      }, //消息发送成功回调
      fail: function (e) {
        console.log('Fail'); //如禁言、拉黑后发送消息会失败
      },
    });
    window.WebIM.conn.send(msg.body);
  };

  return (
    <div className="msg">
      {sender && (
        <div>
          <div className="msg-user-me">
            {isSendToAll && (
              <span style={{ color: '#357BF6', fontSize: 12 }}>
                {transI18n('chat.send_to_all')}
              </span>
            )}
            {teacherTag && <Tag className="msg-tag">{transI18n('chat.teacher')}</Tag>}
            {assistantTag && <Tag className="msg-tag">{transI18n('chat.assistant')}</Tag>}
            <span>{userNickName}</span>
            <img src={useAvatarUrl} className="msg-avatar" />
          </div>
          {isTeacher ? (
            <Dropdown overlay={menu} trigger={['contextMenu']}>
              <div className="msg-border">
                <div className="msg-text msg-text-me">
                  <span className="msg-data">{msgData}</span>
                </div>
              </div>
            </Dropdown>
          ) : (
            <div className="msg-border">
              <div className="msg-text msg-text-me">
                <span className="msg-data">{msgData}</span>
              </div>
            </div>
          )}
        </div>
      )}
      {!sender && (
        <div>
          <div className="msg-user-other">
            <img src={useAvatarUrl} className="msg-avatar" />
            <span>{userNickName}</span>
            {teacherTag && <Tag className="msg-tag">{transI18n('chat.teacher')}</Tag>}
            {assistantTag && <Tag className="msg-tag">{transI18n('chat.assistant')}</Tag>}
            {isSendToAll && (
              <span style={{ color: '#357BF6', fontSize: 12 }}>
                {transI18n('chat.send_to_all')}
              </span>
            )}
          </div>
          {isTeacher && (
            <>
              <Dropdown overlay={menu} trigger={['contextMenu']}>
                <div className="msg-text msg-text-other">
                  <span className="msg-data">{msgData}</span>
                </div>
              </Dropdown>
            </>
          )}
          {!isTeacher && <div className="msg-text msg-text-other">{msgData}</div>}
        </div>
      )}
    </div>
  );
};
