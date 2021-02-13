import React from 'react'
import ReactDOM from 'react-dom'
import { PromptDialog } from './prompt'
import { v4 as uuid } from 'uuid'
import { Dialog } from './base'

export interface ConfirmConfig {
  title?: string,
  confirmText: string,
  cancelText: string,
  text?: string,
  showConfirm?: boolean,
  showCancel?: boolean,
  visible: boolean,
  onConfirm?: (...args: any[]) => any,
  onCancel?: (...args: any[]) => any,
  onClose?: (...args: any[]) => any,
}

type ConfigUpdate = ConfirmConfig | ((prevConfig: ConfirmConfig) => ConfirmConfig)

const closeList: any[] = []

const dialogList: any[] = []

export const renderBaseDialog = (config: ConfirmConfig, DialogComponent: any) => {
  const id = uuid()
  const div = document.createElement('div')
  document.body.appendChild(div)

  const close = (...args: any[]) => {
    currentConfig = {
      ...currentConfig,
      visible: false,
      onClose: () => {
        if (typeof config.onClose === 'function') {
          config.onClose()
        }
        destroy.apply(null, args)
      },
    }
    render(currentConfig)
  }

  let currentConfig: any = {...config, close, visible: true }

  const destroy = (...args: any[]) => {
    ReactDOM.unmountComponentAtNode(div)
    if (div.parentNode) {
      div.parentNode.removeChild(div)
    }
    if (config.onClose) {
      config.onClose(...args)
    }
    for (let i = 0; i < closeList.length; i++) {
      const fn = closeList[i]
      if (fn === close) {
        close(...args)
        closeList.splice(i, 1)
        break
      }
    }
  }

  const render = ({ confirmText, cancelText,...props }: ConfirmConfig) => {
    ReactDOM.render(
      <DialogComponent
        {...props}
        confirmText={confirmText}
        cancelText={cancelText}
      />,
      div
    )
  }

  const update = (configUpdate: ConfigUpdate) => {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig)
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate,
      }
    }
    render(currentConfig)
  }

  render(currentConfig)
  dialogList.push(div)
  closeList.push(close)

  return {
    update,
    destroy: close
  }
}

export const confirmDialog = (config: ConfirmConfig) => {
  return renderBaseDialog(config, PromptDialog)
}

export const showBaseDialog = (config: ConfirmConfig) => {
  return renderBaseDialog(config, Dialog)
}

export const removeAllDialog = () => {
  while(dialogList.length) {
    const div = dialogList.shift()
    ReactDOM.unmountComponentAtNode(div)
    if (div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }
  // while(closeList.length) {
  //   const fn = closeList.shift()
  //   fn()
  // }
}