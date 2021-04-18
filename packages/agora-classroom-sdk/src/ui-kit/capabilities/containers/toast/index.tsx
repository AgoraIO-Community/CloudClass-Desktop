import { observer } from 'mobx-react'
import { Toast } from '~ui-kit'
import { useGlobalContext } from 'agora-edu-sdk'
import { useEffect } from 'react'
import { transI18n } from '@/ui-kit/components'

type ToastType = any

export const ToastContainer = observer(() => {
  const {toastQueue, addToast, removeToast, toastEventObserver} = useGlobalContext()

  const toast = (type: string, props?: any) => addToast(transI18n(type), props)


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
  }
  

  useEffect(() => {
    toastEventObserver.subscribe((evt: any) => {
      const toastOperation = toastMap[evt.eventName]

      if (toastOperation) {
        toastOperation(evt.props)
      }
    })
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