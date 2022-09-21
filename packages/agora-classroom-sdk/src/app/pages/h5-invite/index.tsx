import { JoinRoomResponse, RoomAPI } from '@/app/api/room';
import { UserApi } from '@/app/api/user';
import { CommonHelmet } from '@/app/components/common-helmet';
import { useSettingsH5 } from '@/app/components/settings';
import { useHomeStore } from '@/app/hooks';
import { useCheckRoomInfo } from '@/app/hooks/useCheckRoomInfo';
import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { useLoading } from '@/app/hooks/useLoading';
import { useNickNameRule } from '@/app/hooks/useNickNameRule';
import { formatRoomID, ShareLink } from '@/app/utils';
import { EduRoleTypeEnum } from 'agora-edu-core';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { getI18n } from 'react-i18next';
import { useHistory } from 'react-router';
import {
  AButton,
  AForm,
  AFormItem,
  AInput,
  aMessage,
  SvgIconEnum,
  SvgImg,
  useAForm,
  useI18n,
} from '~ui-kit';
import './index.css';

type InviteFormValue = {
  nickName: string;
};

export const H5Invite = () => {
  const { openSettings, SettingsContainer } = useSettingsH5();
  const [shareRoomInfo, setShareRoomInfo] = useState<JoinRoomResponse & { owner: string }>();
  const { setLoading } = useLoading();
  const { joinRoomHandle } = useJoinRoom();
  const { rule: nickNameRule } = useNickNameRule();
  const transI18n = useI18n();
  const [form] = useAForm<InviteFormValue>();
  const { checkRoomInfoBeforeJoin, h5ClassModeIsSupport } = useCheckRoomInfo();
  const homeStore = useHomeStore();
  const i18n = getI18n();
  const history = useHistory();

  // 根据分享信息初始化
  useEffect(() => {
    const data = ShareLink.instance.parseHashURLQuery(location.hash);
    if (data) {
      setLoading(true);
      RoomAPI.shared
        .join({ roomId: data.roomId, role: EduRoleTypeEnum.student })
        .then((response) => {
          setShareRoomInfo({
            ...response.data.data,
            owner: data.owner,
          });
        })
        .catch((error) => {
          console.warn('fetch room info failed. error:%o', error);
          aMessage.error(transI18n('fcr_api_tips_fetch_room_info_fault'));
          setLoading(false);
        });
      // 将本地的区域和分享的区域对齐
      if (data.region) {
        homeStore.setRegion(data.region);
      }
    } else {
      // history.push('/h5');
    }
  }, []);

  const onSubmit = () => {
    form.validateFields().then((data) => {
      UserApi.shared.nickName = data.nickName;
      if (!shareRoomInfo) {
        aMessage.error(transI18n('fcr_api_tips_fetch_room_info_fault'));
        return false;
      }
      const { roomDetail, token, appId } = shareRoomInfo;
      const { serviceType, ...rProps } = roomDetail.roomProperties;
      if (!checkRoomInfoBeforeJoin(roomDetail)) {
        return;
      }
      if (!h5ClassModeIsSupport(roomDetail.roomType)) {
        return;
      }
      setLoading(true);
      joinRoomHandle(
        {
          roomId: roomDetail.roomId,
          roomName: roomDetail.roomName,
          roomType: roomDetail.roomType,
          roomServiceType: serviceType,
          userId: UserApi.shared.userInfo.companyId,
          userName: data.nickName,
          role: EduRoleTypeEnum.student,
          token,
          appId,
        },
        { roomProperties: rProps },
      ).finally(() => {
        setLoading(false);
      });
    });
  };

  const roomDetail = shareRoomInfo ? shareRoomInfo.roomDetail : undefined;

  const footerTip = useMemo(() => {
    if (i18n.language === 'en') {
      return (
        <div className="tip">
          You can <span className="link"> copy Invitation </span> and send to attendees.
        </div>
      );
    }
    return (
      <div className="tip">
        你可以<span className="link"> 复制课堂邀请 </span>并发送给参加者。
      </div>
    );
  }, [i18n.language]);

  return (
    <>
      <CommonHelmet></CommonHelmet>
      <div className="h5-invite">
        <div className="hello">{transI18n('fcr_h5_invite_hello')}</div>
        <div className="welcome">
          {transI18n('fcr_home_label_welcome_message')}
          <SvgImg type={SvgIconEnum.SETTINGS} size={20} onClick={openSettings} />
        </div>
        <div className="content">
          <div className="room-info">
            <header>{transI18n('fcr_home_label_logo')}m</header>
            <div className="inviter">
              <div className="name">{shareRoomInfo?.owner}</div>
              <div>{transI18n('fcr_sharelink_label_invitation')}</div>
            </div>
            <div className="room-name">{roomDetail?.roomName}</div>
            <div className="room-id">
              <span>{roomDetail && formatRoomID(roomDetail?.roomId)}</span>
              <SvgImg type={SvgIconEnum.COPY} size={22} />
            </div>
            <div className="room-time">
              <div className="start-time">
                <div className="time">
                  {roomDetail && dayjs(roomDetail.startTime).format('HH:mm')}
                </div>
                <div className="date">
                  {roomDetail && dayjs(roomDetail.startTime).format('YYYY-MM-DD')}
                </div>
              </div>
              <div className="duration">30mins</div>
              <div className="end-time">
                <div className="time">
                  {roomDetail && dayjs(roomDetail.endTime).format('HH:mm')}
                </div>
                <div className="date">
                  {roomDetail && dayjs(roomDetail.endTime).format('YYYY-MM-DD')}
                </div>
              </div>
            </div>
          </div>
          <AForm<InviteFormValue>
            className="form"
            initialValues={{
              nickName: UserApi.shared.nickName,
            }}>
            <div className="form-item">
              <div className="label">{transI18n('fcr_joinroom_label_name')}</div>
              <AFormItem name="nickName" rules={nickNameRule}>
                <AInput
                  maxLength={50}
                  placeholder={transI18n('fcr_joinroom_tips_name')}
                  suffix={<SvgImg type={SvgIconEnum.EDIT} size={16} />}
                />
              </AFormItem>
            </div>
          </AForm>
        </div>
        <div className="footer">
          <AButton className="join-btn" onClick={onSubmit}>
            {transI18n('fcr_join_room_button_join')}
          </AButton>
          {footerTip}
        </div>
      </div>
      <SettingsContainer></SettingsContainer>
    </>
  );
};
