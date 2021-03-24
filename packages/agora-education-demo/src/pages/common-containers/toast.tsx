import { observer } from 'mobx-react'
import React from 'react'
import { Toast } from 'agora-scenario-ui-kit'
import { useUIStore } from '@/hooks'
import { ToastType } from '@/stores/app/ui'

export const ToastContainer = observer(() => {
  const uiStore = useUIStore()
  return (
    <div style={{justifyContent: 'center', display: 'flex'}}>
      {uiStore.toastQueue.map((value: ToastType, idx: number) => 
        <Toast
          style={{position:'absolute', top: 50}}
          key={`${value.id}`}
          type={value.type}
          closeToast={() => {
            uiStore.removeToast(`${value.id}`)
          }}
        >{value.desc}</Toast>
      )}
    </div>
  )
})