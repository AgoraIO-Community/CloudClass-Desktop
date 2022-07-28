import { Button, CheckBox, Modal, Select, transI18n } from '~ui-kit';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { useStore } from '@/infra/hooks/ui-store';
import './index.css';

export const CameraMirrorCheckBox = observer((props: { id?: string }) => {
  const {
    deviceSettingUIStore: { setMirror, isMirror },
  } = useStore();

  return (
    <CheckBox
      id={props.id}
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

const StageChoose = observer(() => {
  const {
    deviceSettingUIStore: { stageVisible, setStageVisible },
  } = useStore();

  return (
    <div
      className="device-title"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 0,
      }}>
      <div>{transI18n('device.stage_area')}</div>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
          }}>
          {[true, false].map((value) => (
            <label
              className="cursor-pointer"
              style={{ display: 'flex', alignItems: 'center' }}
              htmlFor={`${value}`}
              key={`${+value}`}>
              <input
                type="radio"
                id={`${value}`}
                name="device-selection"
                onChange={(_) => setStageVisible(value)}
                checked={value ? stageVisible : !stageVisible}
              />
              <span className="device-desc" style={{ marginLeft: 5 }}>
                {value ? transI18n('stage.visible') : transI18n('stage.hidden')}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
});

type SettingProps = {
  className?: string;
  restProps?: unknown;
};

const Setting: React.FC<SettingProps> = observer(({ className, ...restProps }) => {
  const {
    deviceSettingUIStore: { deviceStage },
  } = useStore();
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
          <div style={{ display: 'flex', alignItems: 'center' }}>{transI18n('device.camera')}</div>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}>
              <CameraMirrorCheckBox id="CameraMirrorCheckBox" />
              <label htmlFor="CameraMirrorCheckBox" className="beauty-desc cursor-pointer">
                {transI18n('media.mirror')}
              </label>
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
      {deviceStage ? (
        <div className="device-choose">
          <StageChoose />
        </div>
      ) : null}
    </div>
  );
});

export const RoomDeviceSettingContainer = observer(({ id }: any) => {
  const {
    shareUIStore: { removeDialog },
  } = useStore();

  return (
    <Modal
      title={<span>{transI18n('pretest.settingTitle')}</span>}
      style={{ width: 360 }}
      footer={[
        <Button key="ok" action="ok">
          {transI18n('toast.confirm')}
        </Button>,
      ]}
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
