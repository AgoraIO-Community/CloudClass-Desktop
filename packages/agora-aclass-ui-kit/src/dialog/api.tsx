import React from 'react'
import ReactDOM from 'react-dom'
import { PromptDialog } from './base'

export interface ConfirmConfig {
  title: string,
  confirmText: string,
  cancelText: string,
  contentText?: string,
  visible: boolean,
  onConfirm?: (...args: any[]) => any,
  onCancel?: (...args: any[]) => any,
  onClose?: (...args: any[]) => any,
}

type ConfigUpdate = ConfirmConfig | ((prevConfig: ConfirmConfig) => ConfirmConfig)

const closeList: any[] = []

export const confirmDialog = (config: ConfirmConfig) => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  const close = (...args: any[]) => {
    currentConfig = {
      ...currentConfig,
      visible: false,
      onClose: () => {
        if (typeof config.onClose === 'function') {
          config.onClose();
        }
        destroy.apply(null, args);
      },
    };
    render(currentConfig);
  }

  let currentConfig: any = {...config, close, visible: true }

  const destroy = (...args: any[]) => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    if (config.onClose) {
      config.onClose(...args);
    }
    for (let i = 0; i < closeList.length; i++) {
      const fn = closeList[i];
      if (fn === close) {
        close(...args)
        closeList.splice(i, 1);
        break;
      }
    }
  }

  const render = ({ confirmText, cancelText,...props }: ConfirmConfig) => {
    ReactDOM.render(
      <PromptDialog
        {...props}
        confirmText={confirmText}
        cancelText={cancelText}
      />,
      div
    );
  }

  const update = (configUpdate: ConfigUpdate) => {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig);
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate,
      };
    }
    render(currentConfig);
  }

  render(currentConfig);
  closeList.push(close)

  return {
    update,
    destroy: close
  }
}