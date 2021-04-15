import { observer } from 'mobx-react'
import { Toast } from '~ui-kit'
import { useUIStore } from '@/hooks'
import { ToastType } from '@/stores/app/ui'
import { useToastContext } from '~capabilities/hooks'

export const ToastContainer = observer(() => {
  const {toastQueue, removeToast} = useToastContext()
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