/* eslint global-require: off */
import { app, dialog, ipcMain, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import fs from 'fs-extra'

import MenuBuilder from './menu'

const url = require('url')
const path = require('path')

import { jadn_format } from './src/utils'

// Paths
const ROOT_DIR = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT_DIR, 'app')

const isDevelopment = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log)
}

// Window objects
let mainWindow = null

// Share global objects
let args = isDevelopment ? {cwd: ROOT_DIR, name: 'config.dev'} : {}
global.store = new Store(args)

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (isDevelopment || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')()
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
}

/* Add event listeners... */
const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(APP_DIR, 'preload.js')
    }
  })

  if (isDevelopment) {
    console.log("Dev Run")
    mainWindow.webContents.openDevTools()
  }

  // Load content
  let windowURL = url.format({
    pathname: path.join(APP_DIR, 'app.html'),
    protocol: 'file',
    slashes: true
  })
  /*
  if (isDevelopment) {
    windowURL = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    })
  }
  */
  mainWindow.loadURL(windowURL)

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    // Open the DevTools automatically if developing
    if (isDevelopment) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus()
    setImmediate(() => {
      mainWindow.focus()
    })
  })

  // Build and add app menu
  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  if (isDevelopment || process.env.DEBUG_PROD === 'true') {
    await installExtensions()
  }

  createMainWindow()
  new AppUpdater()
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    createMainWindow()
  }
})

// Recent Documents action `Open`
app.on('open-file', (event, filePath) => {
  fs.readJson(filePath, (err, packageObj) => {
    if (err){
      dialog.showMessageBoxSync(mainWindow, {
        type: 'error',
        title: 'Open Error',
        detail: 'DETAILS -> TBD...'
      })
      console.error(err)
    } else {
      let result = {
        filePaths: [filePath],
        contents: packageObj
      }
      mainWindow.webContents.send('file-open', result)
    }
  })
})

// Renderer event actions
ipcMain.on('file-save', (event, arg) => {
  dialog.showSaveDialog(mainWindow, {
    title: 'Save Schema',
    defaultPath: arg.filePath || app.getPath('documents'),
    filters: [
      { name: 'Default', extensions: ['jadn'] },
      { name: 'JSON Schema', extensions: ['json'] }
    ]
  }).then(result => {
    if (!result.canceled) {
      arg.filePath = result.filePath
      fs.outputFile(arg.filePath, jadn_format(arg.contents), err => {
        if (err){
          dialog.showMessageSync(this.mainWindow, {
            type: 'error',
            title: 'Open Error',
            detail: 'DETAILS -> TBD...'
          })
          console.error(err)
        } else {
          event.reply('save-reply', arg)
        }
      })
    }
  }).catch(err => {
    dialog.showMessageBoxSync(this.mainWindow, {
      type: 'error',
      title: 'Open Error',
      detail: 'DETAILS -> TBD...'
    })
    console.log(err)
  })
})