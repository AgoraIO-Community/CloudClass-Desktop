import { Lambda, reaction, observable, action } from 'mobx';
import { DeviceSettingUIStore } from '../common/device-setting';
import { DEVICE_DISABLE } from 'agora-edu-core';
export class LectureH5DeviceSettingUIStore extends DeviceSettingUIStore {
  private disposers: Array<Lambda> = [];
  @observable facingMode: 'user' | 'environment' = 'user';
  @action.bound
  toggleFacingMode() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    track.setFacingMode(this.facingMode);
  }

  private enableLocalVideo = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
    return;
  };
  private enableLocalAudio = (value: boolean) => {
    const track = this.classroomStore.mediaStore.mediaControl.createMicrophoneAudioTrack();
    if (value) {
      track.start();
    } else {
      track.stop();
    }
  };
  onInstall(): void {
    this.disposers.push(
      reaction(
        () => this.cameraAccessors,
        () => {
          const { cameraDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (cameraDeviceId !== undefined && cameraDeviceId !== DEVICE_DISABLE) {
            const track = mediaControl.createCameraVideoTrack();
            track.setDeviceId(cameraDeviceId);
            this.logger.info('enableLocalVideo => true. Reason: camera device selected');
            this.enableLocalVideo(true);
          } else {
            this.logger.info('enableLocalVideo => false. Reason: camera device not selected');
            this.enableLocalVideo(false);
          }
        },
      ),
    );
    // 麦克风设备变更
    this.disposers.push(
      reaction(
        () => this.micAccessors,
        () => {
          const { recordingDeviceId, mediaControl } = this.classroomStore.mediaStore;
          if (recordingDeviceId !== undefined && recordingDeviceId !== DEVICE_DISABLE) {
            const track = mediaControl.createMicrophoneAudioTrack();
            track.setRecordingDevice(recordingDeviceId);
            this.logger.info('enableLocalAudio => true. Reason: mic device selected');
            this.enableLocalAudio(true);
          } else {
            this.logger.info('enableLocalAudio => false. Reason: mic device not selected');
            this.enableLocalAudio(false);
          }
        },
      ),
    );
  }
}
