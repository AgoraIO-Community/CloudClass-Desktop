import { ConfirmConfig, confirmDialog } from './api'

export const dialogManager = {
  add: (args: ConfirmConfig) => {
    return confirmDialog(args)
  },
  remove: () => {

  }
}