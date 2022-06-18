import {
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  app,
  shell,
  dialog,
  MenuItemConstructorOptions
} from 'electron'

// https://github.com/electron/electron/blob/v18.2.0/docs/fiddles/menus/customize-menus/main.js

import { join } from 'path'

// 🚧 Use ['ENV_NAME'] to avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`

const ipcpreload = join(__dirname, '../preload/ipcpreload.js')


let WindowTypeA: BrowserWindow

async function createWindowTypeA() {
  WindowTypeA = new BrowserWindow({
    title: 'Window Type A',
    webPreferences: {
      //splash: splash,
      ipcpreload: ipcpreload,
      nodeIntegration: true,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      webviewTag: false,
    },
  })

  if (app.isPackaged) {
    WindowTypeA.loadFile(join(__dirname, '../../index_A.html'))
  } else {
    WindowTypeA.loadURL(url + '/../../index_A.html')
    WindowTypeA.webContents.openDevTools()
  }

  // Test active push message to Renderer-process
  WindowTypeA.webContents.on('did-finish-load', () => {
    WindowTypeA?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Make all links open with the browser, not with the application
  WindowTypeA.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

const windowAsubmenu = [
  {
    role: 'OpenWindowA',
    click () {
      createWindowTypeA()
      WindowTypeA.show()
    }
  }
]

const template: MenuItemConstructorOptions[] = [
  {
    role: 'fileMenu',
    submenu: [
      {
        role: 'quit'
      }
    ]
  },

  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow.id === 1){
            BrowserWindow.getAllWindows().forEach(win => {
              if (win.id > 1) win.close()
            })
          }
          focusedWindow.reload()
        }
      }
    ]
  },

  {
    label: 'WindowTypeA',
    submenu: [
      {
        label: 'OpenWindowA',
        click () {
          createWindowTypeA()
          WindowTypeA.show()
        }
      }
    ]
  }
]


const menu = Menu.buildFromTemplate(template)
export default menu
