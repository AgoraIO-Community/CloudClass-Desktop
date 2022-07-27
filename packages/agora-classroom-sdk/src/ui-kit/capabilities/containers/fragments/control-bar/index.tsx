import { FC, useCallback, useEffect, useState } from 'react';
import { sendToRendererProcess, sendToMainProcess, listenChannelMessage } from '@/infra/utils/ipc';
import { WindowID } from '@/infra/api';
import './index.css';
import { DevicePlatform } from 'agora-edu-core';
import { RemoteControlBarUIParams } from '@/infra/stores/common/type';
import { ChannelType, IPCMessageType } from '@/infra/utils/ipc-channels';
import { ControlState } from '@/infra/stores/common/remote-control/type';
import { EduUserStruct } from 'agora-edu-core';
import { Select, SvgIcon, useI18n, Tooltip, transI18n, SvgIconEnum } from '~ui-kit';

type Props = {
  canReSelectScreen?: boolean;
};
const useStudentList = () => {
  const [studentList, setStudentList] = useState<EduUserStruct[]>([]);
  useEffect(() => {
    const cleaner = listenChannelMessage(ChannelType.Message, (_e, message) => {
      if (message.type === IPCMessageType.StudentListUpdated) {
        setStudentList(message.payload as EduUserStruct[]);
      }
    });
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: IPCMessageType.FetchStudentList,
    });
    return cleaner;
  }, []);

  return { studentList };
};

const useActions = () => {
  const changeControlState = (state: string) => {
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: IPCMessageType.ControlStateChanged,
      payload: {
        state,
      },
    });
  };
  const selectScreen = () => {
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: IPCMessageType.SwitchScreenShareDevice,
      payload: {},
    });
  };
  const hide = () => {
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: IPCMessageType.HideControlBar,
    });
  };
  const close = () => {
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: IPCMessageType.StopScreenShareAndRemoteControl,
    });
  };

  let handle: ReturnType<typeof setTimeout>;
  const updateWindowSize = (height: number, timeout = 0) => {
    const call = () =>
      sendToMainProcess(ChannelType.UpdateBrowserWindow, WindowID.RemoteControlBar, {
        height,
      });
    if (handle) {
      clearTimeout(handle);
    }
    if (timeout) {
      handle = setTimeout(call, 180);
    } else {
      call();
    }
  };

  return {
    changeControlState,
    selectScreen,
    hide,
    close,
    updateWindowSize,
  };
};

type IconButtonProps = {
  title: string;
  type: SvgIconEnum;
  hoverType: SvgIconEnum;
  onClick: () => void;
};

const IconButton: FC<IconButtonProps> = ({ title, type, onClick, hoverType }) => {
  return (
    <Tooltip title={title} placement="bottom">
      <SvgIcon
        hoverType={hoverType}
        type={type}
        size={24}
        onClick={onClick}
      />
    </Tooltip>
  );
};

export const ControlBar: FC<Props> = ({ canReSelectScreen = false }) => {
  const { changeControlState, selectScreen, hide, close, updateWindowSize } = useActions();
  const [controlState, setControlState] = useState<string>(ControlState.NotAllowedControlled);
  const t = useI18n();
  const { studentList } = useStudentList();
  useEffect(() => {
    const cleaner = listenChannelMessage(ChannelType.Message, (_e, message) => {
      if (message.type === IPCMessageType.ControlStateChanged) {
        setControlState(
          (
            message.payload as {
              state: string;
            }
          ).state,
        );
      }
    });
    return cleaner;
  }, []);
  const onStudentChange = useCallback(
    (studentUuid: string) => {
      const student = studentList.find((i) => i.userUuid === studentUuid);
      if (student) {
        if (
          ![DevicePlatform.MACOS, DevicePlatform.WINDOWS].includes(
            student.userProperties?.device?.platform,
          )
        ) {
          setControlState(ControlState.NotAllowedControlled);
          changeControlState(studentUuid);
          return;
        }
      }
      setControlState(studentUuid);
      changeControlState(studentUuid);
    },
    [studentList],
  );
  return (
    <div className="fcr-remote-control-bar">
      <div className="fcr-remote-control-bar-select">
        <Select
          size="sm"
          options={[
            {
              value: ControlState.NotAllowedControlled as string,
              label: t('fcr_rc_control_bar_disallow_student_control'),
            },
          ].concat(
            studentList.map((i) => ({
              value: i.userUuid,
              label: transI18n('fcr_rc_control_bar_allow_student_control', { reason: i.userName }),
            })),
          )}
          onChange={onStudentChange}
          value={controlState}
          onOpen={() => {
            setTimeout(() => {
              const height =
                document.querySelector('.fcr-remote-control-bar-select .options-container')
                  ?.clientHeight || 0;

              updateWindowSize(RemoteControlBarUIParams.height + height);
            });
          }}
          onClose={() => {
            updateWindowSize(RemoteControlBarUIParams.height, 180);
          }}
        />
      </div>
      <IconButton
        title={t('fcr_share_switch')}
        type={SvgIconEnum.SWITCH_SCREEN_SHARE}
        hoverType={SvgIconEnum.SWITCH_SCREEN_SHARE_ACTIVE}
        onClick={selectScreen}
      />
      {/* padding */}
      <div style={{ marginRight: 10 }} />
      <IconButton
        title={t('fcr_close')}
        type={SvgIconEnum.CLOSE}
        hoverType={SvgIconEnum.CLOSE}
        onClick={() => {
          setControlState(ControlState.NotAllowedControlled);
          close();
        }}
      />
    </div>
  );
};
