const deviceStateMap: Record<string, string> = {
  'video': 'pretest.camera_move_out',
  'audio': 'pretest.mic_move_out',
  'teacher_video_error': 'pretest.teacher_video_may_not_work'
}

export class MediaDeviceState {
  static getNotice(v: string) {
    return deviceStateMap[v]
  }
}