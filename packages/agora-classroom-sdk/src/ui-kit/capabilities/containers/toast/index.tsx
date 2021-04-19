import { observer } from 'mobx-react'
import { Toast } from '~ui-kit'
import { useGlobalContext } from 'agora-edu-core'
import { useEffect } from 'react'
import { transI18n } from '@/ui-kit/components'
import { formatCountDown, TimeFormatType } from '@/infra/utils'

type ToastType = any

export const ToastContainer = observer(() => {
  const {toastQueue, addToast, removeToast, toastEventObserver} = useGlobalContext()

  const toast = (desc: string, props?: any, toastType: 'success' | 'warning' | 'error' = 'success') => addToast(transI18n(desc, props), toastType)

  const toastMap = {
    'toast.granted_board_success': () => toast('toast.granted_board_success'),
    'toast.failed_to_authorize_whiteboard': (props: any) => toast('toast.failed_to_authorize_whiteboard', props),
    'toast.revoke_board_success': (props: any) => toast('toast.revoke_board_success', props),
    'toast.failed_to_deauthorize_whiteboard': (props: any) => toast('toast.failed_to_deauthorize_whiteboard', props),
    'toast.teacher_accept_whiteboard': () => toast('toast.teacher_accept_whiteboard'),
    'toast.teacher_cancel_whiteboard': () => toast('toast.teacher_cancel_whiteboard'),
    'toast.failed_to_end_screen_sharing': (props: any) => toast('toast.failed_to_end_screen_sharing', props),
    'toast.failed_to_initiate_screen_sharing_to_remote': (props: any) => toast('toast.failed_to_initiate_screen_sharing_to_remote', props),
    'toast.failed_to_enable_screen_sharing': (props: any) => toast('toast.failed_to_enable_screen_sharing', props),
    'toast.failed_to_initiate_screen_sharing': (props: any) => toast('toast.failed_to_initiate_screen_sharing', props),
    'toast.create_screen_share_failed': (props: any) => toast('toast.create_screen_share_failed', props),
    'toast.failed_to_enable_screen_sharing_permission_denied': (props: any) => toast('toast.failed_to_enable_screen_sharing_permission_denied', props),
    'toast.setting_start_failed': (props: any) => toast('toast.setting_start_failed'),
    'toast.the_course_ends_successfully': (props: any) => toast('toast.the_course_ends_successfully'),
    'toast.setting_ended_failed': (props: any) => toast('toast.setting_ended_failed'),
    'toast.start_recording_failed': (props: any) => toast('toast.start_recording_failed', props),
    'toast.failed_to_end_recording': (props: any) => toast('toast.failed_to_end_recording'),
    'error.class_end': (props: any) => toast('error.class_end', props),
    'error.room_is_full': (props: any) => toast('error.room_is_full', props),
    'error.apply_co_video_limit': (props: any) => toast('error.apply_co_video_limit', props),
    'error.send_co_video_limit': (props: any) => toast('error.send_co_video_limit', props),
    'error.cannot_join': (props: any) => toast('error.cannot_join', props),
    'error.unknown': (props: any) => toast('error.unknown', props),
    'toast.audio_equipment_has_changed': (props: any) => toast('toast.audio_equipment_has_changed', props),
    'toast.video_equipment_has_changed': (props: any) => toast('toast.video_equipment_has_changed', props),
    'toast.time_interval_between_start': (props: any) => toast('toast.time_interval_between_start', {reason: formatCountDown(props.reason, TimeFormatType.Message)}),
    'toast.time_interval_between_end': (props: any) => toast('toast.time_interval_between_close', {reason: formatCountDown(props.reason, TimeFormatType.Message)}),
    'toast.class_is_end': (props: any) => toast('toast.class_is_end', {reason: formatCountDown(props.reason, TimeFormatType.Message)},'error'),
    'toast.time_interval_between_close': (props: any) => toast('toast.time_interval_between_close', {reason: formatCountDown(props.reason, TimeFormatType.Message)}),
    'private_media_chat.chat_started': (props: any) => toast('private_media_chat.chat_started', props),
    'private_media_chat.chat_ended': (props: any) => toast('private_media_chat.chat_ended', props),
    'co_video.received_student_cancel': (props: any) => toast('co_video.received_student_cancel', props),
    'co_video.received_teacher_refused': (props: any) => toast('co_video.received_teacher_refused', props),
    'co_video.received_student_hands_up': (props: any) => toast('co_video.received_student_hands_up', props)
  }
  

  useEffect(() => {
    toastEventObserver.subscribe((evt: any) => {
      console.log('evt', evt)
      const toastOperation = toastMap[evt.eventName]

      if (toastOperation) {
        toastOperation(evt.props)
      }
    })
    return () => {
      toastEventObserver.complete()
    }
  }, [toastEventObserver])

  return (
    <div style={{justifyContent: 'center', display: 'flex'}}>
      {toastQueue.map((value: ToastType, idx: number) => 
        <Toast
          style={{position:'absolute', top: (50 * (idx + 1)), zIndex: 9999}}
          key={`${value.id}`}
          type={value.type}
          closeToast={() => {
            removeToast(`${value.id}`)
          }}
        >{value.desc}</Toast>
      )}
    </div>
  )
})