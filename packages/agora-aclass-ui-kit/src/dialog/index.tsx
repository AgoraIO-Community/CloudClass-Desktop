import { ConfirmConfig, confirmDialog } from './api'

export {PromptDialog, Dialog} from './base'

export const dialogManager = {
  add: (args: ConfirmConfig) => {
    return confirmDialog(args)
  },
  remove: () => {

  }
}