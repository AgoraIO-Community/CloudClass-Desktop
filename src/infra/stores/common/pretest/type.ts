export enum DeviceStateChangedReason {
  cameraFailed = 'pretest.device_not_working',
  micFailed = 'pretest.device_not_working',
  newDeviceDetected = 'new_device_detected',
  cameraUnplugged = 'pretest.camera_move_out',
  micUnplugged = 'pretest.mic_move_out',
  playbackUnplugged = 'pretest.playback_move_out',
}
