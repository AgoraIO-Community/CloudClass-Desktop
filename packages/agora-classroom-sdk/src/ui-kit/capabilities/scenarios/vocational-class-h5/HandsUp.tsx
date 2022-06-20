import { useVocationalH5UIStores } from '@/infra/hooks/use-edu-stores';
import { observer } from 'mobx-react';
import React, { useMemo, useState } from 'react';
import { Icon, Popover, SvgImg } from '~ui-kit';
import { WaveArmSender } from '../../containers/hand-up/sender';
import { EduClassroomConfig } from 'agora-edu-core';
import { EduVocationalH5UIStore } from '@/infra/stores/vocational-h5';

export const HandsUp = observer(() => {
  const { handUpUIStore, classroomStore, streamUIStore, deviceSettingUIStore } = useVocationalH5UIStores() as EduVocationalH5UIStore;
  const [visible, setVisible] = useState(false);
  const {
    waveArm,
    teacherUuid,
    offPodium,
  } = handUpUIStore;
  const { acceptedList } = classroomStore.roomStore;
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const {} = streamUIStore;
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
      <Icon
        className="iconfont"
        type={!streamUIStore.localCameraOff ? 'm-camera' : 'm-camera-off'}
        onClick={() => streamUIStore.toggleLocalVideo()}
      />
      {/* 切换摄像头 */}
      <Icon
        className="iconfont"
        type={
          isOnPodium && !streamUIStore.localCameraOff
            ? 'm-switch-camera'
            : 'm-switch-camera-disabled'
        }
        onClick={() => {
          deviceSettingUIStore.toggleCamera();
        }}
      />
      {/* 开关麦克风 */}
      <Icon
        className="iconfont"
        type={!streamUIStore.localMicOff ? 'm-micphone' : 'm-micphone-off'}
        onClick={() => streamUIStore.toggleLocalAudio()}
      />
      {/* 举手上台 */}
      <WaveArmSender
        isH5={true}
        isOnPodium={isOnPodium}
        onOffPodium={handleOffPodium}
        />
    </div>
  );
  return (
    <div className="hands-up">
      <Popover
        visible={visible}
        overlayClassName="hands-up-popover"
        content={content}
        placement="topRight">
        <SvgImg type="hands-up-before" size={18} onClick={() => setVisible(!visible)} />
      </Popover>
    </div>
  );
});
