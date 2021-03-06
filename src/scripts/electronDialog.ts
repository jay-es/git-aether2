import { remote } from 'electron'

export const showError = (message: string, detail?: string) => {
  remote.dialog.showMessageBox(remote.getCurrentWindow(), {
    detail,
    message: message.replace(/\t/g, '    '),
    type: 'error'
  })
}

export const confirmDialog = (message: string, detail?: string) => {
  const res = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
    detail,
    message,
    type: 'question',
    buttons: ['Yes', 'No']
  })

  return res === 0
}
