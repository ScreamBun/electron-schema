/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, shell, BrowserWindow, WebPreferences } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { actionsJADN } from './jadn';

// Config
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const urlPrefix = `file://${DIST_DIR}`;
const ASSETS_DIR = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(ROOT_DIR, '../assets');
const getAssetPath = (...paths: string[]): string => path.join(ASSETS_DIR, ...paths);

// Updating
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// App Window Setup
let mainWindow: BrowserWindow | null = null;

if (isProd) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDev || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map(name => installer[name]),
      forceDownload
    ).catch(console.log);
};

// Window Creation
const createWindow = async () => {
  if (isDev || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    show: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load content
  mainWindow.loadURL(`${urlPrefix}/index.html`);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    // Open the DevTools automatically if developing
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Build and add app menu
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create main BrowserWindow when electron is ready
app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Setup Actions for JADN
actionsJADN(mainWindow);
