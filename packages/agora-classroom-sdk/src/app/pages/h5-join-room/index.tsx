import { UserApi } from '@/app/api/user';
import { CommonHelmet } from '@/app/components/common-helmet';
import { useSettingsH5 } from '@/app/components/settings';
import { useElementWithI18n } from '@/app/hooks/useComWithI18n';
import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { useNickNameRule } from '@/app/hooks/useNickNameRule';
import { EduRoleTypeEnum, Platform } from 'agora-edu-core';
import { getI18n } from 'react-i18next';
import { AButton, AForm, AFormItem, AInput, SvgIconEnum, SvgImg, useAForm, useI18n } from '~ui-kit';
import './index.css';

type JoinFormValue = {
  roomId: string;
  nickName: string;
};

export const H5JoinRoom = () => {
  const [form] = useAForm<JoinFormValue>();
  const { openSettings, SettingsContainer } = useSettingsH5();
  const { quickJoinRoom } = useJoinRoom();
  const { rule: nickNameRule } = useNickNameRule();
  const transI18n = useI18n();
  const i18n = getI18n();

  const onSubmit = () => {
    form.validateFields().then((data) => {
      UserApi.shared.nickName = data.nickName;
      quickJoinRoom({
        role: EduRoleTypeEnum.student,
        roomId: data.roomId,
        nickName: data.nickName,
        platform: Platform.H5,
      }).finally(() => {
        // setLoading(false);
      });
    });
  };

  const welcome = useElementWithI18n({
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
            <SvgImg type={SvgIconEnum.SETTINGS} size={20} onClick={openSettings} />
          </div>
          {welcome}
          <AForm<JoinFormValue>
            className="form"
            form={form}
            initialValues={{
              nickName: UserApi.shared.nickName,
            }}>
            <div className="form-item">
              <div className="label">{transI18n('fcr_joinroom_label_RoomID')}</div>
              <AFormItem
                name="roomId"
                rules={[{ required: true, message: transI18n('fcr_joinroom_tips_room_id_empty') }]}>
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
};
