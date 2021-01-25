import React, { useEffect, useRef } from 'react';
import './toast.scss';
import { observer } from 'mobx-react';
import { useReplayUIStore, useUIStore } from '@/hooks';
import { BizLogger } from '@/utils/biz-logger';

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

const ToastMessage = (props: ToastProps) => {

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

  const uiStore = useReplayUIStore()

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