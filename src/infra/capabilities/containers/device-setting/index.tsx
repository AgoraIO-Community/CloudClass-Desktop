import { CheckBox, Select } from '@classroom/ui-kit';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import './index.css';
import { RoomPretest } from '../pretest';
import { useEffect } from 'react';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';

export const CameraMirrorCheckBox = observer((props: { id?: string }) => {
  const {
    deviceSettingUIStore: { setMirror, isMirror },
  } = useStore();

  return (
    <CheckBox
      id={props.id}
      checked={isMirror}
      onChange={(e) => {
        setMirror(e.target.checked);
      }}
    />
  );
});

export const MicrophoneSelect = observer(() => {
  const {
    deviceSettingUIStore: { setRecordingDevice, currentRecordingDeviceId, recordingDevicesList },
  } = useStore();

  return (
    <Select
      value={currentRecordingDeviceId}
      onChange={(value) => {
        setRecordingDevice(value);
      }}
      options={recordingDevicesList}></Select>
  );
});

export const CameraSelect = observer(() => {
  const {
    deviceSettingUIStore: { setCameraDevice, currentCameraDeviceId, cameraDevicesList },
  } = useStore();

  return (
    <Select
      value={currentCameraDeviceId}
      onChange={(value) => {
        setCameraDevice(value);
      }}
      options={cameraDevicesList}></Select>
  );
});

export const PlaybackSelect = observer(() => {
  const {
    deviceSettingUIStore: { setPlaybackDevice, currentPlaybackDeviceId, playbackDevicesList },
  } = useStore();

  return (
    <Select
      value={currentPlaybackDeviceId}
      onChange={(value) => {
        setPlaybackDevice(value);
      }}
      options={playbackDevicesList}></Select>
  );
});

export const RoomDeviceSettingContainer = observer(({ id }: { id: string }) => {
  const {
    shareUIStore: { removeDialog },
    streamUIStore: { setSettingsOpened },
  } = useStore();

  useEffect(() => {
    setSettingsOpened(true);
    return () => {
      setSettingsOpened(false);
    };
  }, []);

  return (
    <RoomPretest
      closeable
      showStage={
        EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass &&
        EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher
      }
      onOK={() => removeDialog(id)}
      onCancel={() => removeDialog(id)}
    />
  );
});
