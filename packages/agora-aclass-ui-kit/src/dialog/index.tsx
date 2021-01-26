import { confirmDialog } from './container'

export {PromptDialog, Dialog} from './base'

export const dialogManager = {
  add: (args: any) => {
    confirmDialog(args)
  },
  remove: () => {

  }
}