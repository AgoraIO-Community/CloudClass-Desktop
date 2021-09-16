import { observer } from 'mobx-react';
import { Toast } from '~ui-kit';
import { useGlobalContext, useRoomContext } from 'agora-edu-core';
import { useEffect, useRef } from 'react';
import { transI18n } from '~ui-kit/components';
import { formatCountDown, TimeFormatType } from '@/infra/utils';
import { useUIStore } from '@/infra/hooks';

type ToastType = any;

export const ToastContainer = observer(() => {
  const { toastQueue, addToast, removeToast } = useUIStore();
  const { joined } = useRoomContext();
  const { toastEventObserver } = useGlobalContext();

  const toast = (
    desc: string,
    props?: any,
    toastType: 'success' | 'warning' | 'error' = 'success',
  ) => addToast(transI18n(desc, props), toastType);

  const toastMap = {
    'pretest.device_move_out': (props: any) => toast('pretest.device_move_out', props, 'warning'),
    'toast.failed_to_send_reward': () => toast('toast.failed_to_send_reward'),
    'toast.granted_board_success': () => toast('toast.granted_board_success'),
    'toast.failed_to_authorize_whiteboard': (props: any) =>
      toast('toast.failed_to_authorize_whiteboard', props),
    'toast.revoke_board_success': (props: any) => toast('toast.revoke_board_success', props),
    'toast.failed_to_deauthorize_whiteboard': (props: any) =>
      toast('toast.failed_to_deauthorize_whiteboard', props),
    'toast.teacher_accept_whiteboard': () => toast('toast.teacher_accept_whiteboard'),
    'toast.teacher_cancel_whiteboard': () => toast('toast.teacher_cancel_whiteboard'),
    'toast.failed_to_end_screen_sharing': (props: any) =>
      toast('toast.failed_to_end_screen_sharing', props),
    'toast.failed_to_initiate_screen_sharing_to_remote': (props: any) =>
      toast('toast.failed_to_initiate_screen_sharing_to_remote', props),
    'toast.failed_to_enable_screen_sharing': (props: any) =>
      toast('toast.failed_to_enable_screen_sharing', props),
    'toast.failed_to_initiate_screen_sharing': (props: any) =>
      toast('toast.failed_to_initiate_screen_sharing', props),
    'toast.create_screen_share_failed': (props: any) =>
      toast('toast.create_screen_share_failed', props),
    'toast.failed_to_enable_screen_sharing_permission_denied': (props: any) =>
      toast('toast.failed_to_enable_screen_sharing_permission_denied', props),
    'toast.setting_start_failed': (props: any) => toast('toast.setting_start_failed'),
    'toast.the_course_ends_successfully': (props: any) =>
      toast('toast.the_course_ends_successfully'),
    'toast.setting_ended_failed': (props: any) => toast('toast.setting_ended_failed'),
    'toast.start_recording_failed': (props: any) => toast('toast.start_recording_failed', props),
    'toast.failed_to_end_recording': (props: any) => toast('toast.failed_to_end_recording'),
    'error.class_end': (props: any) => toast('error.class_end', props),
    'error.room_is_full': (props: any) => toast('error.room_is_full', props),
    'error.apply_co_video_limit': (props: any) => toast('error.apply_co_video_limit', props),
    'error.send_co_video_limit': (props: any) => toast('error.send_co_video_limit', props),
    'error.cannot_join': (props: any) => toast('error.cannot_join', props),
    'error.unknown': (props: any) => toast('error.unknown', props),
    'pretest.camera_move_out': (props: any) => toast('pretest.camera_move_out', props, 'error'),
    'pretest.mic_move_out': (props: any) => toast('pretest.mic_move_out', props, 'error'),
    'pretest.teacher_device_may_not_work': (props: any) =>
      toast('pretest.teacher_device_may_not_work', props, 'error'),
    'pretest.detect_new_device_in_room': (props: any) =>
      toast('pretest.detect_new_device_in_room', props, 'success'),
    // 'toast.audio_equipment_has_changed': (props: any) => toast('toast.audio_equipment_has_changed', props),
    // 'toast.video_equipment_has_changed': (props: any) => toast('toast.video_equipment_has_changed', props),
    'toast.time_interval_between_start': (props: any) =>
      toast('toast.time_interval_between_start', {
        reason: formatCountDown(props.reason, TimeFormatType.Message),
      }),
    'toast.time_interval_between_end': (props: any) =>
      toast('toast.time_interval_between_close', {
        reason: formatCountDown(props.reason, TimeFormatType.Message),
      }),
    'toast.class_is_end': (props: any) =>
      toast(
        'toast.class_is_end',
        { reason: formatCountDown(props.reason, TimeFormatType.Message) },
        'error',
      ),
    'toast.chat_disable': (props: any) => toast('toast.chat_disable', props),
    'toast.chat_enable': (props: any) => toast('toast.chat_enable', props),
    'toast.time_interval_between_close': (props: any) =>
      toast('toast.time_interval_between_close', {
        reason: formatCountDown(props.reason, TimeFormatType.Message),
      }),
    'private_media_chat.chat_started': (props: any) =>
      toast('private_media_chat.chat_started', props),
    'private_media_chat.chat_ended': (props: any) => toast('private_media_chat.chat_ended', props),
    'co_video.received_student_cancel': (props: any) =>
      toast('co_video.received_student_cancel', props),
    'co_video.received_teacher_refused': (props: any) =>
      toast('co_video.received_teacher_refused', props),
    'co_video.received_student_hands_up': (props: any) =>
      toast('co_video.received_student_hands_up', props),
    'co_video.remote_close_camera': (props: any) => toast('co_video.remote_close_camera', props),
    'co_video.remote_open_camera': (props: any) => toast('co_video.remote_open_camera', props),
    'co_video.remote_open_microphone': (props: any) =>
      toast('co_video.remote_open_microphone', props),
    'co_video.remote_grant_board': (props: any) => toast('co_video.remote_grant_board', props),
    'co_video.remote_close_microphone': (props: any) =>
      toast('co_video.remote_close_microphone', props),
    'co_video.remote_revoke_board': (props: any) => toast('co_video.remote_revoke_board', props),
    'co_video.received_teacher_accepted': (props: any) =>
      toast('co_video.received_teacher_accepted', props),
    'co_video.received_message_timeout': (props: any) =>
      toast('co_video.received_message_timeout', props),
    'co_video.hands_up_requsted': (props: any) => toast('co_video.hands_up_requsted', props),
    'co_video.hands_up_cancelled': (props: any) => toast('co_video.hands_up_cancelled', props),
    'roster.close_student_co_video': (props: any) => toast('roster.close_student_co_video', props),
    'roster.open_student_co_video': (props: any) => toast('roster.open_student_co_video', props),
    'toast.add_screen_share': (props: any) => toast('toast.add_screen_share', props),
    'toast.remove_screen_share': (props: any) => toast('toast.remove_screen_share', props),
    'toast.mute_chat': (props: any) => toast('toast.mute_chat', props),
    'toast.unmute_chat': (props: any) => toast('toast.unmute_chat', props),
    'toast.remote_mute_chat': (props: any) => toast('toast.remote_mute_chat', props),
    'toast.remote_unmute_chat': (props: any) => toast('toast.remote_unmute_chat', props),
    'toast.upload_failure': (props: any) => toast('toast.upload_failure', props),
    'toast.download_success': (props: any) => toast('toast.download_success', props),
    'toast.download_failure': (props: any) => toast('toast.download_failure', props),
  };

  const roomRef = useRef<boolean>(joined);

  useEffect(() => {
    roomRef.current = joined;
  }, [joined]);

  useEffect(() => {
    toastEventObserver.subscribe((evt: any) => {
      console.log('toastEventObserver evt', evt);
      const toastOperation = toastMap[evt.eventName];

      if (toastOperation) {
        if (evt.eventName === 'pretest.detect_new_device_in_room' && !roomRef.current) {
          return;
        }
        toastOperation(evt.props);
      }
    });
    return () => {
      toastEventObserver.complete();
    };
  }, [toastEventObserver]);

  return (
    <div style={{ justifyContent: 'center', display: 'flex' }}>
      {toastQueue.map((value: ToastType, idx: number) => (
        <Toast
          style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
          key={`${value.id}`}
          type={value.type}
          closeToast={() => {
            removeToast(`${value.id}`);
          }}>
          {value.desc}
        </Toast>
      ))}
    </div>
  );
});
