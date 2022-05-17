import { FC, useCallback, useEffect, useState } from 'react';
import {
  sendToRendererProcess,
  ChannelType,
  sendToMainProcess,
  listenChannelMessage,
} from '@/infra/utils/ipc';
import { WindowID } from '@/infra/api';
import { ControlState, IPCMessageType } from '@/infra/types';
import { Select, Tooltip, t, SvgIcon } from '~ui-kit';
import './index.css';
import { EduUser, DevicePlatform } from 'agora-edu-core';
import { RemoteControlBarUIParams } from '@/infra/stores/common/type';

type Props = {
  canReSelectScreen?: boolean;
};
const useStudentList = () => {
  const [studentList, setStudentList] = useState<EduUser[]>([]);
  useEffect(() => {
    const cleaner = listenChannelMessage(ChannelType.Message, (_e, message) => {
      if (message.type === IPCMessageType.StudentListUpdated) {
        setStudentList(message.payload as EduUser[]);
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
  color: string;
  type: string;
  onClick: () => void;
};

const IconButton: FC<IconButtonProps> = ({ title, color, type, onClick }) => {
  return (
    <Tooltip title={title} placement="bottom">
      <span>
        <SvgIcon
          canHover
          hoverType={type === 'switch-screen-share' ? type + '-active' : type}
          color={color}
          type={type}
          size={24}
          onClick={onClick}
        />
      </span>
    </Tooltip>
  );
};

export const ControlBar: FC<Props> = ({ canReSelectScreen = false }) => {
  const { changeControlState, selectScreen, hide, close, updateWindowSize } = useActions();
  const [controlState, setControlState] = useState<string>(ControlState.NotAllowedControlled);
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
          ].concat(studentList.map((i) => ({ value: i.userUuid, label: i.userName })))}
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
        color="#7B88A0"
        type="switch-screen-share"
        onClick={selectScreen}
      />
      {/* padding */}
      <div style={{ marginRight: 10 }} />
      <IconButton
        title={t('fcr_close')}
        color="#7B88A0"
        type="close"
        onClick={() => {
          setControlState(ControlState.NotAllowedControlled);
          close();
        }}
      />
    </div>
  );
};
