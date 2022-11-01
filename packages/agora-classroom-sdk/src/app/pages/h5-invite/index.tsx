import { RoomJoinResponse } from '@/app/api/room';
import { CommonHelmet } from '@/app/components/common-helmet';
import { useSettingsH5 } from '@/app/components/settings';
import { formatRoomID } from '@/app/hooks';
import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { useLangSwitchValue } from '@/app/hooks/useLangSwitchValue';
import { useNickNameForm } from '@/app/hooks/useNickNameForm';
import { useNoAuthUser } from '@/app/hooks/useNoAuthUser';
import { GlobalStoreContext, RoomStoreContext } from '@/app/stores';
import {
  checkRoomInfoBeforeJoin,
  ErrorCode,
  h5ClassModeIsSupport,
  i18nError,
  messageError,
  Status,
} from '@/app/utils';
import { shareLink } from '@/app/utils/share';
import { EduRoleTypeEnum, Platform } from 'agora-edu-core';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import {
  AButton,
  AForm,
  AFormItem,
  AInput,
  ModalMethod,
  SvgIconEnum,
  SvgImg,
  useAForm,
  useI18n,
} from '~ui-kit';
import './index.css';

type InviteFormValue = {
  nickName: string;
};

export const H5Invite = observer(() => {
  const { setLoading, setRegion, region, language } = useContext(GlobalStoreContext);
  const { joinRoomNoAuth } = useContext(RoomStoreContext);
  const history = useHistory();
  const location = useLocation();
  const transI18n = useI18n();
  const { openSettings, SettingsContainer } = useSettingsH5();
  const [shareRoomInfo, setShareRoomInfo] = useState<RoomJoinResponse & { owner: string }>();
  const { joinRoomHandle } = useJoinRoom();
  const { rule: nickNameRule } = useNickNameForm();
  const [form] = useAForm<InviteFormValue>();
  const { userId, nickName, setNickName } = useNoAuthUser();

  useEffect(() => {
    const data = shareLink.parseSearch(location.search);
    if (!data) {
      ModalMethod.confirm({
        content: i18nError(ErrorCode.INVALID_SHARE_LINK),
        onOk: () => {
          history.push('/h5');
        },
      });
      return;
    }
    setLoading(true);
    joinRoomNoAuth({ roomId: data.roomId, role: EduRoleTypeEnum.student, userUuid: userId })
      .then((response) => {
        setShareRoomInfo({
          ...response.data.data,
          owner: data.owner,
        });
      })
      .catch((error) => {
        console.warn('fetch room info failed. error:%o', error);
        messageError(ErrorCode.FETCH_ROOM_INFO_FAILED);
      })
      .finally(() => {
        setLoading(false);
      });
    // 将本地的区域和分享的区域对齐
    // if (data.region) {
    //   setRegion(data.region);
    // }
    return () => {
      ModalMethod.destroyAll();
    };
  }, []);

  const onSubmit = () => {
    form.validateFields().then((data) => {
      setNickName(data.nickName);
      if (!shareRoomInfo) {
        return false;
      }
      const { roomDetail, token, appId } = shareRoomInfo;
      const { serviceType, ...rProps } = roomDetail.roomProperties;

      {
        const checkResult = checkRoomInfoBeforeJoin(roomDetail);
        if (checkResult.status === Status.Failed) {
          messageError(checkResult.code);
          return;
        }
      }

      {
        const checkResult = h5ClassModeIsSupport(roomDetail.roomType);
        if (checkResult.status === Status.Failed) {
          messageError(checkResult.code);
          return;
        }
      }

      setLoading(true);
      joinRoomHandle(
        {
          token,
          appId,
          userId: userId,
          userName: data.nickName,
          roomId: roomDetail.roomId,
          roomName: roomDetail.roomName,
          roomType: roomDetail.roomType,
          roomServiceType: serviceType,
          role: EduRoleTypeEnum.student,
          region,
          language,
          platform: Platform.H5,
        },
        { roomProperties: rProps },
      )
        .catch((error) => {
          console.warn('h5 join page joinRoomHandle failed. error:%o', error);
          if (error.code) {
            messageError(error.code);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const roomDetail = shareRoomInfo ? shareRoomInfo.roomDetail : undefined;

  const footerTip = useLangSwitchValue({
    en: (
      <div className="tip">
        You can <span className="link"> copy Invitation </span> and send to attendees.
      </div>
    ),
    zh: (
      <div className="tip">
        你可以<span className="link"> 复制课堂邀请 </span>并发送给参加者。
      </div>
    ),
  });

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
              <div>{transI18n('fcr_share_link_label_invitation')}</div>
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
            form={form}
            className="form"
            initialValues={{
              nickName: nickName,
            }}>
            <div className="form-item">
              <div className="label">{transI18n('fcr_join_room_label_name')}</div>
              <AFormItem name="nickName" rules={nickNameRule}>
                <AInput
                  maxLength={50}
                  placeholder={transI18n('fcr_join_room_tips_name')}
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
});
