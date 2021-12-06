import { Button, CheckBox, Modal, Select, transI18n } from '~ui-kit';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { useStore } from '~hooks/use-edu-stores';
import './index.css';

export const CameraMirrorCheckBox = observer(() => {
  const {
    deviceSettingUIStore: { setMirror, isMirror },
  } = useStore();

  return (
    <CheckBox
      style={{ width: 12, height: 12 }}
      checked={isMirror}
      onChange={(e: any) => {
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

type SettingProps = {
  className?: string;
  restProps?: object;
};

const Setting: React.FC<SettingProps> = observer(({ className, ...restProps }) => {
  const cls = classnames({
    [`setting`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <div className={cls} {...restProps} style={{ width: 318 }}>
      <div className="device-choose">
        <div
          className="device-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <div>{transI18n('device.camera')}</div>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}>
              <CameraMirrorCheckBox />
              <span className="beauty-desc" style={{ marginLeft: 5 }}>
                {transI18n('media.mirror')}
              </span>
            </div>
          </div>
        </div>
        <CameraSelect />
      </div>
      <div className="device-choose">
        <div className="device-title">{transI18n('device.microphone')}</div>
        <MicrophoneSelect />
      </div>
      <div className="device-choose">
        <div className="device-title">{transI18n('device.speaker')}</div>
        <PlaybackSelect />
      </div>
    </div>
  );
});

export const RoomDeviceSettingContainer = observer(({ id }: any) => {
  const {
    shareUIStore: { removeDialog },
  } = useStore();

  return (
    <Modal
      title={transI18n('pretest.settingTitle')}
      width={360}
      footer={[<Button action="ok">{transI18n('toast.confirm')}</Button>]}
      onCancel={() => {
        removeDialog(id);
      }}
      onOk={() => {
        removeDialog(id);
      }}
      closable={true}>
      <Setting />
    </Modal>
  );
});
