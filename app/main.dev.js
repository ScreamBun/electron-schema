import { app, BrowserWindow } from 'electron'
import MenuBuilder from './menu'

const url = require('url')
const path = require('path')

// Paths
const ROOT_DIR = __dirname
const APP_DIR = path.join(ROOT_DIR, 'app')

const isDevelopment = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

// Window objects
let mainWindow
// import Menu from './menu'


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

console.log(app)
/* Add event listeners... */
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: './preload.js'
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

  const windowParams = {
    // store: new Store()
  }
  mainWindow.loadURL(windowURL, windowParams)

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
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  createMainWindow()
  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    createMainWindow()
  }
})