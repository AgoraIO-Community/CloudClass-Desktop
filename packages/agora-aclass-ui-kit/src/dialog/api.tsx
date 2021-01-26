import React from 'react'
import ReactDOM from 'react-dom'
import { PromptDialog } from './base'

// export interface DialogInstance {
//   notice: (props: any) => any,
//   remove: (props: any) => any,
//   destroy: () => any,
// }

export interface ConfirmConfig {
  title: string,
  subtitle?: string,
  visible?: boolean,
  onConfirm?: (...args: any[]) => any,
  onCancel?: (...args: any[]) => any,
  onClose?: (...args: any[]) => any,
}

type ConfigUpdate = ConfirmConfig | ((prevConfig: ConfirmConfig) => ConfirmConfig)

const closeList: any[] = []

export const confirmDialog = (config: ConfirmConfig) => {
  const div = document.createElement('div')
  document.body.appendChild(div)
  let currentConfig = {...config, visible: true }

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
        closeList.splice(i, 1);
        break;
      }
    }
  }

  const render = ({ okText, cancelText, prefixCls, ...props }: any) => {
    setTimeout(() => {
      console.log("render >>> ", JSON.stringify(props))
      ReactDOM.render(
        <PromptDialog
          {...props}
          confirmText={okText}
          cancelText={cancelText}
        />,
        div,
      );
    })
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

  const close = (...args: any[]) => {
    currentConfig = {
      ...currentConfig,
      visible: false,
      onClose: () => {
        if (typeof config.onClose === 'function') {
          config.onClose();
        }
        destroy.apply(this, args);
      },
    };
    render(currentConfig);
  }

  render(currentConfig);
  closeList.push(close)

  return {
    update,
    destroy: close
  }
}