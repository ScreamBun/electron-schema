/* eslint global-require: off */
import 'v8-compile-cache';
import {
  app,
  dialog,
  ipcMain,
  BrowserWindow
} from 'electron';
import fs from 'fs-extra';
import url from 'url';
import path from 'path';
import MenuBuilder from './menu';
import {
  jadnFormat,
  ConverterScript,
  SchemaFormats
} from './src/utils';
import pyodideNode from './src/utils/PyodideNode/PyodideNode';

// Config
const isDevelopment = process.env.NODE_ENV !== 'production';
const isWin = ['win32', 'win64'].includes(process.platform);

// Python Setup
let schemaConverters = {};
let pyodide = null;

const pyodideSetup = async () => {
  await pyodideNode.loadLanguage();
  pyodide = pyodideNode.getModule();

  // pyodide is now ready to use...
  await pyodide.loadPackage('jadnschema');

  // configure the python environment
  pyodide.runPython(ConverterScript);
  schemaConverters = Object.assign(
    {},
    ...Object.values(SchemaFormats).map(k => ({
      [k]: s => pyodide.pyimport(`convert2${k}`)(JSON.stringify(s))
    }))
  );
};

// App Window Setup
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

// Window objects
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
} else if (isDevelopment || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (isWin) {
  app.commandLine.appendSwitch('high-dpi-support', 'true');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

/* Add event listeners... */
const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (isDevelopment) {
    console.log('Dev Run');
    mainWindow.webContents.openDevTools();
  }

  // Load content
  mainWindow.loadURL(
    url.format({
      pathname: `${__dirname}/app.html`,
      protocol: 'file',
      slashes: true
    })
  );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();

    // Open the DevTools automatically if developing
    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus();
    setImmediate(() => {
      mainWindow.focus();
    });
  });

  // New Window
  mainWindow.webContents.on(
    'new-window',
    // eslint-disable-next-line no-shadow
    (event, url, frameName, disposition, options) => {
      if (frameName === 'modal') {
        // open window as modal
        event.preventDefault();
        Object.assign(options, {
          modal: true,
          parent: mainWindow,
          width: 300,
          height: 300
        });
        event.newGuest = new BrowserWindow(options);
      }
    }
  );

  // Build and add app menu
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  await pyodideSetup();
  if (isDevelopment || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }
  createMainWindow();
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Recent Documents action `Open`
app.on('open-file', (event, filePath) => {
  fs.readJson(filePath, (err, packageObj) => {
    if (err) {
      dialog.showMessageBoxSync(mainWindow, {
        type: 'error',
        title: 'Open Error',
        detail: 'DETAILS -> TBD...'
      });
      console.error(err);
    } else {
      mainWindow.webContents.send('file-open', {
        filePaths: [filePath],
        contents: packageObj
      });
    }
  });
});

// Renderer event actions
const convertSchema = args => {
  const schema = args.schema ? args.schema : {};
  const format = args.format ? args.format : 'NULL';

  if (Object.values(SchemaFormats).includes(format)) {
    return schemaConverters[format](schema);
  }
  return null;
};

ipcMain.on('file-save', (event, args) => {
  const kargs = { ...args };
  let ext = kargs.format || null;
  if (ext !== null) {
    ext = kargs.filePath ? path.extname(kargs.filePath).substring(1) : SchemaFormats.JADN;
  }

  dialog
    .showSaveDialog(mainWindow, {
      title: 'Save Schema',
      defaultPath: kargs.filePath || app.getPath('documents'),
      filters: [{ name: 'Schema Format', extensions: [ext] }]
    })
    .then(result => {
      if (!result.canceled) {
        kargs.filePath = result.filePath;
        let contents = convertSchema({ format: ext, schema: kargs.contents });
        switch (ext) {
          case SchemaFormats.JADN:
            contents = jadnFormat(contents);
            break;
          case SchemaFormats.JSON:
            contents = JSON.stringify(contents, null, 2);
            break;
          default:
            break;
        }

        fs.outputFile(kargs.filePath, contents, err => {
          if (err) {
            dialog.showMessageSync(mainWindow, {
              type: 'error',
              title: 'Open Error',
              detail: 'DETAILS -> TBD...'
            });
            console.error(err);
          } else {
            if (ext !== SchemaFormats.JADN) {
              delete kargs.filePath;
            }
            event.reply('save-reply', kargs);
          }
        });
      }
      return result;
    })
    .catch(err => {
      dialog.showMessageBoxSync(mainWindow, {
        type: 'error',
        title: 'Open Error',
        detail: 'DETAILS -> TBD...'
      });
      console.log(err);
    });
});

ipcMain.handle('convert-schema', (event, args) => convertSchema(args));
