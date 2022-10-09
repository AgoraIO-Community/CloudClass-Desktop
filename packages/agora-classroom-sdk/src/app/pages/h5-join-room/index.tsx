import { CommonHelmet } from '@/app/components/common-helmet';
import { useSettingsH5 } from '@/app/components/settings';
import { useRoomIdForm } from '@/app/hooks';
import { useElementWithI18n } from '@/app/hooks/useComWithI18n';
import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { useNickNameForm } from '@/app/hooks/useNickNameForm';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '@/app/stores';
import { formatRoomID } from '@/app/utils';
import { EduRoleTypeEnum, Platform } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import { getI18n } from 'react-i18next';
import {
  AButton,
  AForm,
  AFormItem,
  AFormProps,
  AInput,
  SvgIconEnum,
  SvgImg,
  useAForm,
  useI18n,
} from '~ui-kit';
import './index.css';

type JoinFormValue = {
  roomId: string;
  nickName: string;
};

export const H5JoinRoom = observer(() => {
  const transI18n = useI18n();
  const i18n = getI18n();
  const userStore = useContext(UserStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);
  const [form] = useAForm<JoinFormValue>();
  const { openSettings, SettingsContainer } = useSettingsH5();
  const { quickJoinRoom } = useJoinRoom();
  const { rule: nickNameRule } = useNickNameForm();
  const { rule: roomIdRule, formFormatRoomID, getFormattedRoomIdValue } = useRoomIdForm();

  const onSubmit = () => {
    if (!userStore.isLogin) {
      userStore.login();
      return;
    }
    setLoading(true);
    form
      .validateFields()
      .then((data) => {
        userStore.setNickName(data.nickName);
        data.roomId = getFormattedRoomIdValue(data.roomId);
        return quickJoinRoom({
          role: EduRoleTypeEnum.student,
          roomId: data.roomId,
          nickName: data.nickName,
          platform: Platform.H5,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formOnValuesChange: AFormProps<JoinFormValue>['onValuesChange'] = (changeValues: any) => {
    if (changeValues.roomId) {
      formFormatRoomID(form, changeValues.roomId, 'roomId');
      roomStore.setLastJoinedRoomId(changeValues.roomId);
    }
  };

  const welcomeElement = useElementWithI18n({
    en: (
      <div className="welcome">
        Welcome to
        <br />
        FlexibleClassroom
      </div>
    ),
    zh: (
      <div className="welcome">
        欢迎
        <br /> 使用灵动课堂
      </div>
    ),
  });

  return (
    <>
      <CommonHelmet></CommonHelmet>
      <div className="h5-join-room">
        <div className="header-bg">
          <div className={`logo ${i18n.language}`}></div>
        </div>
        <div className="content">
          <div className="hello">
            {transI18n('fcr_h5_invite_hello')}
            {userStore.isLogin ? (
              <SvgImg type={SvgIconEnum.SETTINGS} size={20} onClick={openSettings} />
            ) : null}
          </div>
          {welcomeElement}
          <AForm<JoinFormValue>
            className="form"
            form={form}
            onValuesChange={formOnValuesChange}
            initialValues={{
              nickName: userStore.nickName,
              roomId: formatRoomID(roomStore.lastJoinedRoomId),
            }}>
            <div className="form-item">
              <div className="label">{transI18n('fcr_joinroom_label_RoomID')}</div>
              <AFormItem name="roomId" rules={roomIdRule}>
                <AInput placeholder={transI18n('fcr_join_room_tips_room_id')} />
              </AFormItem>
            </div>
            <div className="form-item">
              <div className="label">{transI18n('fcr_joinroom_label_name')}</div>
              <AFormItem name="nickName" rules={nickNameRule}>
                <AInput placeholder={transI18n('fcr_joinroom_tips_name')} />
              </AFormItem>
            </div>
          </AForm>
          <AButton className="join-btn" onClick={onSubmit}>
            {transI18n('fcr_join_room_button_join')}
          </AButton>
        </div>
      </div>
      <SettingsContainer />
    </>
  );
});
