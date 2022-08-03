import { useVocationalH5UIStores } from '@/infra/hooks/ui-store';
import { EduVocationalH5UIStore } from '@/infra/stores/vocational-h5';
import { EduClassroomConfig } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useMemo, useState } from 'react';
import { Popover, SvgIconEnum, SvgImg } from '~ui-kit';
import { WaveArmSender } from '../../../../containers/hand-up/sender';
import './index.css';

interface HandsUpProps {
  style?: CSSProperties;
  className?: string;
}

export const HandsUp = observer<FC<HandsUpProps>>(({ style, className = '' }) => {
  const { handUpUIStore, classroomStore, streamUIStore, deviceSettingUIStore } =
    useVocationalH5UIStores() as EduVocationalH5UIStore;
  const [visible, setVisible] = useState(false);
  const { waveArm, teacherUuid, offPodium } = handUpUIStore;
  const { acceptedList } = classroomStore.roomStore;
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const isOnPodium = useMemo(
    () => !!acceptedList.find((u) => u.userUuid === userUuid),
    [acceptedList, userUuid],
  );

  const waveArmDuration = (duration: number) => {
    return waveArm(teacherUuid, duration);
  };
  const handleOffPodium = () => {
    offPodium(userUuid);
    streamUIStore.localCameraOff;
  };

  const content = (
    <div className="hands-up-content">
      {/* 开关摄像头 */}

      <SvgImg
        className="iconfont"
        type={!streamUIStore.localCameraOff ? SvgIconEnum.M_CAMERA : SvgIconEnum.M_CAMERA_OFF}
        onClick={() => streamUIStore.toggleLocalVideo()}
      />
      {/* 切换摄像头 */}
      <SvgImg
        className="iconfont"
        type={
          isOnPodium && !streamUIStore.localCameraOff
            ? SvgIconEnum.M_SWITCH_CAMERA
            : SvgIconEnum.M_SWITCH_CAMERA
        }
        onClick={() => {
          deviceSettingUIStore.toggleCamera();
        }}
      />
      {/* 开关麦克风 */}
      <SvgImg
        className="iconfont"
        type={!streamUIStore.localMicOff ? SvgIconEnum.M_MICPHONE : SvgIconEnum.M_MICPHONE_OFF}
        onClick={() => streamUIStore.toggleLocalAudio()}
      />
      {/* 举手上台 */}
      <WaveArmSender isH5={true} isOnPodium={isOnPodium} onOffPodium={handleOffPodium} />
    </div>
  );
  return (
    <div className={`hands-up ${className}`} style={style}>
      <Popover
        visible={visible}
        overlayClassName="hands-up-popover"
        content={content}
        placement="topRight">
        <SvgImg type={SvgIconEnum.HANDS_UP_ACTIVE} size={24} onClick={() => setVisible(!visible)} />
      </Popover>
    </div>
  );
});
