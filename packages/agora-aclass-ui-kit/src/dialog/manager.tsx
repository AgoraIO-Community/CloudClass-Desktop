import { ConfirmConfig, confirmDialog, removeAllDialog, showBaseDialog } from './api'

export const dialogManager = {
  confirm: (args: ConfirmConfig) => {
    return confirmDialog(args)
  },
  show: (args: ConfirmConfig) => {
    return showBaseDialog(args)
  },
  removeAll: () => {
    return removeAllDialog()
  }
}