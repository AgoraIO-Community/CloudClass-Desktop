import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useHomeUIStore, useUIStore } from '@/hooks';
import { BizLogger } from '@/utils/biz-logger';
import { t } from '@/i18n';
import { BrushToast } from 'agora-aclass-ui-kit';

export interface SnackbarMessage {
  message: string;
  key: number;
}

export const useMounted = () => {
  const mounted = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])
  return mounted.current
}

export const useTimeout = (fn: CallableFunction, delay: number) => {
  const mounted = useMounted()

  const timer = useRef<any>(null)

  useEffect(() => {
    timer.current = setTimeout(() => {
      fn && mounted && fn()
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }, delay)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [timer])
}

interface ToastProps {
  message: string
  closeToast: CallableFunction
}

interface BrushToastProps {
  isBrushEnabled: boolean
  closeToast: CallableFunction
}

export const ToastMessage = (props: ToastProps) => {

  useTimeout(() => {
    props && props.closeToast()
  }, 2500)

  return (
    <div className={"custom-toast"}>
      <div className="toast-container">
        <span className="text">{props.message}</span>
      </div>
    </div>
  )
}

export const BrushToastMessage = (props: BrushToastProps) => {
  useTimeout(() => {
    props && props.closeToast()
  }, 1500)

  return (
    <BrushToast isShowBrushToast={true} text={props.isBrushEnabled ? t('aclass.board.brushEnabled') : t('aclass.board.brushDisabled')} disableIcon={!props.isBrushEnabled} />
  )
}

export const BrushToastContent = observer(() => {
  const uiStore = useUIStore()

  return (
    <div className="notice-message-container">
      {uiStore.brushToastQueue.map((item: {ts: number, enabled: boolean}, idx: number) => 
        <BrushToastMessage
          isBrushEnabled={item.enabled}
          key={`${idx}${item.ts}`}
          closeToast={() => {
            uiStore.removeBrushToast(item.ts)
            BizLogger.info("close brush Toast", item.enabled)
          }}
        />
      )}
    </div>
  )
})


export const AcadsocToastMessage = (props: ToastProps) => {
  useTimeout(() => {
    props && props.closeToast()
  }, 2500)

  return (
    <div className={"custom-acadsoc-toast"}>
      <div className="toast-icon"></div>
      <div className="toast-container">
        <span className="text" dangerouslySetInnerHTML={{__html:props.message.replace('{{', '<span class="highlight">').replace('}}', '</span>')}}></span>
      </div>
    </div>
  )
}


export const AcadsocToast = observer(() => {
  const uiStore = useUIStore()

  return (
    <div className="notice-message-container">
      {uiStore.acadsocToastQueue.map((message: string, idx: number) => 
        <AcadsocToastMessage
          message={message}
          key={`${idx}${message}${Date.now()}`}
          closeToast={() => {
            uiStore.removeAcadsocToast(message)
            BizLogger.info("close Toast", message)
          }}
        />
      )}
    </div>
  )
})

export const Toast = observer(() => {

  const uiStore = useUIStore()

  return (
    <div className="notice-message-container">
      {uiStore.toastQueue.map((message: string, idx: number) => 
        <ToastMessage
          message={message}
          key={`${idx}${message}${Date.now()}`}
          closeToast={() => {
            uiStore.removeToast(message)
            BizLogger.info("close Toast", message)
          }}
        />
      )}
    </div>
  )
})

export const ToastContainer = observer(() => {

  const uiStore = useHomeUIStore()

  return (
    <div className="notice-message-container-comp">
      {uiStore.toastQueue.map((message: string, idx: number) => 
        <ToastMessage
          message={message}
          key={`${idx}${message}${Date.now()}`}
          closeToast={() => {
            uiStore.removeToast(message)
            BizLogger.info("close Toast", message)
          }}
        />
      )}
    </div>
  )
})