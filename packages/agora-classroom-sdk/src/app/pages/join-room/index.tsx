import { RadioIcon } from '@/app/components/radio-icon';
import { useHistoryBack } from '@/app/hooks';
import { useCheckRoomInfo } from '@/app/hooks/useCheckRoomInfo';
import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { useNickNameForm } from '@/app/hooks/useNickNameForm';
import { useRoomIdForm } from '@/app/hooks/useRoomIdForm';
import { NavFooter, NavPageLayout } from '@/app/layout/nav-page-layout';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '@/app/stores';
import { formatRoomID, ShareLink } from '@/app/utils';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { AForm, AFormItem, AInput, useAForm, useI18n } from '~ui-kit';
import './index.css';
type JoinFormValue = {
  roomId: string;
  nickName: string;
};

export const JoinRoom = observer(() => {
  const transI18n = useI18n();

  const roles = [
    {
      label: transI18n('fcr_joinroom_option_teacher'),
      value: EduRoleTypeEnum.teacher,
      backgroundColor: '#5765FF',
    },
    {
      label: transI18n('fcr_joinroom_option_student'),
      value: EduRoleTypeEnum.student,
      backgroundColor: '#F5655C',
    },
    {
      label: transI18n('fcr_joinroom_option_audience'),
      value: EduRoleTypeEnum.assistant,
      backgroundColor: '#83BC53',
    },
  ];

  const [role, setRole] = useState(roles[1].value);
  const { rule: roomIdRule, formFormatRoomID, getFormattedRoomIdValue } = useRoomIdForm();
  const { rule: nickNameRule } = useNickNameForm();
  const [form] = useAForm<JoinFormValue>();
  const { quickJoinRoom } = useJoinRoom();
  const { setLoading, setRegion } = useContext(GlobalStoreContext);
  const userStore = useContext(UserStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const historyBackHandle = useHistoryBack();
  const query = ShareLink.instance.parseHashURLQuery(location.hash);
  const { checkRoomID } = useCheckRoomInfo();
  useEffect(() => {
    if (query && query.roomId) {
      form.setFieldValue('roomId', formatRoomID(query.roomId));
    } else {
      form.setFieldValue('roomId', formatRoomID(roomStore.lastJoinedRoomId));
    }
    // 将本地的区域和分享的区域对齐
    if (query && query.region) {
      setRegion(query.region);
    }
    form.setFieldValue('nickName', userStore.nickName);
  }, []);

  const onSubmit = () => {
    form.validateFields().then((data) => {
      data.roomId = getFormattedRoomIdValue(data.roomId);
      data.roomId && roomStore.setLastJoinedRoomId(data.roomId);
      if (!checkRoomID(data.roomId)) {
        return;
      }
      setLoading(true);
      userStore.nickName = data.nickName;
      quickJoinRoom({
        role,
        roomId: data.roomId,
        nickName: data.nickName,
      }).finally(() => {
        setLoading(false);
      });
    });
  };

  const formOnValuesChange = (changeValues: any) => {
    if (changeValues.roomId) {
      formFormatRoomID(form, changeValues.roomId, 'roomId');
    }
  };

  return (
    <NavPageLayout
      title={transI18n('fcr_joinroom_label_join')}
      className="join-room"
      footer={
        <NavFooter
          okText={transI18n('fcr_joinroom_button_confirm')}
          cancelText={transI18n('fcr_joinroom_button_cancel')}
          onOk={onSubmit}
          onCancel={historyBackHandle}
        />
      }>
      <AForm<JoinFormValue>
        className="join-form header-blank footer-blank"
        form={form}
        onValuesChange={formOnValuesChange}>
        <div className="form-item">
          <div className="label">{transI18n('fcr_joinroom_label_RoomID')}</div>
          <AFormItem name="roomId" rules={roomIdRule}>
            <AInput disabled={!!(query && query.roomId)} />
          </AFormItem>
        </div>
        <div className="form-item">
          <div className="label">{transI18n('fcr_joinroom_label_name')}</div>
          <AFormItem name="nickName" rules={nickNameRule}>
            <AInput maxLength={50} />
          </AFormItem>
        </div>
        <div className="form-item col-start-1 col-end-3">
          <div className="label">{transI18n('fcr_joinroom_label_role')}</div>
          <div className="role-choose">
            {roles.map((v) => {
              return (
                <div
                  key={v.value}
                  onClick={() => {
                    setRole(v.value);
                  }}
                  className="role-item"
                  style={{ backgroundColor: v.backgroundColor }}>
                  {v.label} <RadioIcon checked={v.value === role} />
                </div>
              );
            })}
          </div>
        </div>
      </AForm>
    </NavPageLayout>
  );
});
