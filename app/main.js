/* eslint global-require: off */
import {
  app,
  dialog,
  ipcMain,
  BrowserWindow
} from 'electron';
import fs from 'fs';
import { convert, SchemaFormats } from 'jadnschema';
import url from 'url';
import MenuBuilder from './menu';

// Config
const isDevelopment = process.env.NODE_ENV !== 'production';
const isWin = ['win32', 'win64'].includes(process.platform);
app.allowRendererProcessReuse = true;

// JADN Setup
const schemaConverters = {
  [SchemaFormats.HTML]: schema => convert.schema.html.dumps(schema),
  [SchemaFormats.JADN]: schema => convert.schema.jadn.dumps(schema),
  // [SchemaFormats.JIDL]: schema => convert.schema.jidl.dumps(schema),
  [SchemaFormats.JSON]: schema => convert.schema.json.dumps(schema),
  [SchemaFormats.MarkDown]: schema => convert.schema.md.dumps(schema)
  // [SchemaFormats.PDF]: schema => convert.schema.pdf.dumps(schema),
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
  require('source-map-support').install();
} else if (isDevelopment) {
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
  if (isDevelopment) {
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
  try {
    const rawFile = fs.readFileSync(filePath).toString();
    const packageObj = JSON.parse(rawFile);
    mainWindow.webContents.send('file-open', {
      filePaths: [filePath],
      contents: packageObj
    });
  } catch (err) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      title: 'Open Error',
      message: 'DETAILS -> TBD...'
    });
    console.error(err);
  }
});

// Renderer event actions
const convertSchema = args => {
  const schema = args.schema ? args.schema : {};
  const format = args.format || 'NULL';

  if (Object.values(SchemaFormats).includes(format)) {
    return schemaConverters[format](schema);
  }
  return null;
};

ipcMain.on('file-save', (event, args) => {
  const kargs = { ...args };
  const ext = kargs.format ||  SchemaFormats.JADN;

  console.log(kargs.filePath);
  console.log(app.getPath('documents'), 'documents');
  kargs.filePath = `${kargs.filePath.substr(0, kargs.filePath.lastIndexOf('.'))}.${ext}`;

  dialog
    .showSaveDialog(mainWindow, {
      title: 'Save Schema',
      defaultPath: kargs.filePath || app.getPath('documents'),
      filters: [{ name: 'Schema Format', extensions: [ext] }]
    })
    .then(result => {
      if (!result.canceled) {
        kargs.filePath = result.filePath;
        const contents = convertSchema({ format: ext, schema: kargs.contents });

        fs.writeFile(kargs.filePath, contents, err => {
          if (err) {
            dialog.showMessageBoxSync(mainWindow, {
              type: 'error',
              title: 'Open Error',
              message: 'DETAILS -> TBD...'
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
        message: 'DETAILS -> TBD...'
      });
      console.log(err);
    });
});

ipcMain.handle('convert-schema', (event, args) => convertSchema(args));
