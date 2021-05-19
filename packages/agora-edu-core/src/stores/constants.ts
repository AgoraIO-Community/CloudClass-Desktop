const deviceStateMap: Record<string, string> = {
  'video': 'pretest.camera_move_out',
  'audio': 'pretest.mic_move_out',
}

export class MediaDeviceState {
  static getNotice(v: string) {
    return deviceStateMap[v]
  }
}