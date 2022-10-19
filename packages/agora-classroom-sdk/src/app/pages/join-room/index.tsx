import { RadioIcon } from '@/app/components/radio-icon';
import { useHistoryBack } from '@/app/hooks';
import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { useNickNameForm } from '@/app/hooks/useNickNameForm';
import { formatRoomID, useRoomIdForm } from '@/app/hooks/useRoomIdForm';
import { NavFooter, NavPageLayout } from '@/app/layout/nav-page-layout';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '@/app/stores';
import { ErrorCode, messageError } from '@/app/utils';
import { EduRoleTypeEnum, Platform } from 'agora-edu-core';
import classNames from 'classnames';
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
      label: transI18n('fcr_join_room_option_teacher'),
      value: EduRoleTypeEnum.teacher,
      backgroundColor: '#5765FF',
    },
    {
      label: transI18n('fcr_join_room_option_student'),
      value: EduRoleTypeEnum.student,
      backgroundColor: '#F5655C',
    },
    {
      label: transI18n('fcr_join_room_option_audience'),
      value: EduRoleTypeEnum.assistant,
      backgroundColor: '#83BC53',
    },
  ];
  const [role, setRole] = useState(roles[1].value);
  const { rule: roomIdRule, formatFormField, getUnformattedValue } = useRoomIdForm();
  const { rule: nickNameRule } = useNickNameForm();
  const [form] = useAForm<JoinFormValue>();
  const { quickJoinRoom } = useJoinRoom();
  const { setLoading } = useContext(GlobalStoreContext);
  const userStore = useContext(UserStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const historyBackHandle = useHistoryBack();

  useEffect(() => {
    form.setFieldValue('roomId', formatRoomID(roomStore.lastJoinedRoomId));
    form.setFieldValue('nickName', userStore.nickName);
  }, []);

  const onSubmit = () => {
    form.validateFields().then((data) => {
      const roomId = getUnformattedValue(data.roomId);
      roomId && roomStore.setLastJoinedRoomId(roomId);
      userStore.setNickName(data.nickName);

      if (!userStore.userInfo) {
        return;
      }

      setLoading(true);
      quickJoinRoom({
        role,
        roomId,
        nickName: data.nickName,
        platform: Platform.PC,
        userId: userStore.userInfo.companyId,
      })
        .catch((error) => {
          console.warn('join page quickJoinRoom failed. error:%o', error);
          if (error.code) {
            messageError(error.code);
          } else {
            messageError(ErrorCode.FETCH_ROOM_INFO_FAILED);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const formOnValuesChange = (changeValues: any) => {
    if (changeValues.roomId) {
      formatFormField(form, changeValues.roomId, 'roomId');
    }
  };

  return (
    <NavPageLayout
      title={transI18n('fcr_join_room_label_join')}
      className="join-room"
      footer={
        <NavFooter
          okText={transI18n('fcr_join_room_button_confirm')}
          cancelText={transI18n('fcr_join_room_button_cancel')}
          onOk={onSubmit}
          onCancel={historyBackHandle}
        />
      }>
      <AForm<JoinFormValue>
        className="join-form header-blank footer-blank"
        form={form}
        onValuesChange={formOnValuesChange}>
        <div className="form-item">
          <div className="label">{transI18n('fcr_join_room_label_RoomID')}</div>
          <AFormItem name="roomId" rules={roomIdRule}>
            <AInput />
          </AFormItem>
        </div>
        <div className="form-item">
          <div className="label">{transI18n('fcr_join_room_label_name')}</div>
          <AFormItem name="nickName" rules={nickNameRule}>
            <AInput maxLength={50} />
          </AFormItem>
        </div>
        <div className="form-item col-start-1 col-end-3">
          <div className="label">{transI18n('fcr_join_room_label_role')}</div>
          <div className="role-choose">
            {roles.map((v) => {
              return (
                <div
                  key={v.value}
                  onClick={() => {
                    setRole(v.value);
                  }}
                  className={classNames({
                    'role-item': 1,
                    checked: v.value === role,
                  })}
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
