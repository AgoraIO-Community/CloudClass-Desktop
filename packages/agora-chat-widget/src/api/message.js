import WebIM from '../utils/WebIM';
import { MSG_TYPE } from '../contants';
import { messageAction } from '../redux/actions/messageAction';
import { message } from 'antd';
import { transI18n } from '~components/i18n';

export class MessageAPI {
  store = null;
  constructor(store) {
    this.store = store;
  }
  // 禁言消息
  sendCmdMsg = (action, userId) => {
    const state = this.store.getState();
    const roomId = state?.propsData.chatRoomId;
    const roomUuid = state?.propsData.roomUuid;
    const roleType = state?.propsData.roleType;
    const loginName = state?.propsData.userName;
    const loginUser = state?.propsData.userUuid;
    var id = WebIM.conn.getUniqueId(); //生成本地消息id
    var msg = new WebIM.message('cmd', id); //创建命令消息
    msg.set({
      to: roomId, //接收消息对象
      action: action, //用户自定义，cmd消息必填
      chatType: 'chatRoom',
      from: loginUser,
      ext: {
        msgtype: MSG_TYPE.common, // 消息类型
        roomUuid: roomUuid,
        role: roleType,
        muteMember: userId || '',
        muteNickName: (userId && state.room.roomUsersInfo[userId].nickname) || '',
        nickName: loginName,
      }, //用户自扩展的消息内容（群聊用法相同）
      success: (id, serverId) => {
        msg.id = serverId;
        msg.body.id = serverId;
        msg.body.time = new Date().getTime().toString();
        this.store.dispatch(messageAction(msg.body, { isHistory: false }));
      }, //消息发送成功回调
      fail: (e) => {
        console.log('Fail'); //如禁言、拉黑后发送消息会失败
      },
    });
    WebIM.conn.send(msg.body);
  };

  //图片消息
  sendImgMsg = (couterRef, fileData) => {
    // e.preventDefault();
    const state = this.store.getState();
    const loginUser = state?.propsData.userUuid;
    const publicRoomId = state?.propsData?.chatRoomId;
    const roleType = state?.propsData.roleType;
    const roomUuid = state?.propsData.roomUuid;
    const userNickName = state?.propsData.userName;
    const userAvatarUrl = state?.loginUserInfo.avatarurl;

    var id = WebIM.conn.getUniqueId(); // 生成本地消息id
    var msg = new WebIM.message('img', id); // 创建图片消息
    let file = fileData ? fileData : WebIM.utils.getFileUrl(couterRef.current); // 将图片转化为二进制文件
    var allowType = {
      jpeg: true,
      jpg: true,
      png: true,
      bmp: true,
    };
    let img = new Image();
    img.src = file.url;
    //加载后才能拿到宽和高
    img.onload = () => {
      if (file.filetype.toLowerCase() in allowType) {
        var option = {
          file: file,
          to: publicRoomId,
          from: loginUser,
          ext: {
            msgtype: MSG_TYPE.common, // 消息类型
            roomUuid: roomUuid,
            role: roleType,
            avatarUrl: userAvatarUrl || '',
            nickName: userNickName,
          },
          width: img.width,
          height: img.height,
          chatType: 'chatRoom',
          onFileUploadError: (err) => {
            // 消息上传失败
            message.error(transI18n('chat.uploading_picture'));
            console.log('onFileUploadError>>>', err);
          },
          onFileUploadComplete: (res) => {
            // 消息上传成功
            console.log('onFileUploadComplete>>>', res);
          },
          success: (id, serverId) => {
            // 消息发送成功回调
            msg.id = serverId;
            msg.body.id = serverId;
            msg.body.time = new Date().getTime().toString();
            this.store.dispatch(messageAction(msg.body, { isHistory: false }));
            couterRef.current.value = null;
          },
          fail: (e) => {
            //如禁言、拉黑后发送消息会失败
            couterRef.current.value = null;
          },
          flashUpload: WebIM.flashUpload,
        };
        msg.set(option);
        WebIM.conn.send(msg.body);
      }
    };
  };

  convertCustomMessage = (message) => {
    if (message?.ext?.range === 3) {
      const customMessage = {
        ...message,
        ext: {
          ...message.ext,
          avatarUrl:
            'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png',
          nickName: message.ext.nickName,
          role: +message.ext.role,
        },
      };
      return customMessage;
    }
    return message;
  };
}
