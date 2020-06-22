/* eslint global-require: off */
import {
  app,
  dialog,
  ipcMain,
  BrowserWindow,
  WebPreferences
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import { convert, SchemaFormats } from 'jadnschema';
import { SchemaSimpleJADN } from 'jadnschema/lib/jadnschema/schema/interfaces';
import path from 'path';
import MenuBuilder from './menu';

// Config
const isDevelopment = process.env.NODE_ENV !== 'production';
app.allowRendererProcessReuse = true;

// JADN Setup
const schemaConverters = {
  [SchemaFormats.HTML]: (schema: SchemaSimpleJADN): string => convert.schema.html.dumps(schema),
  [SchemaFormats.JADN]: (schema: SchemaSimpleJADN): string => convert.schema.jadn.dumps(schema),
  [SchemaFormats.JIDL]: (schema: SchemaSimpleJADN): string => convert.schema.jidl.dumps(schema),
  [SchemaFormats.JSON]: (schema: SchemaSimpleJADN): string => convert.schema.json.dumps(schema),
  [SchemaFormats.MarkDown]: (schema: SchemaSimpleJADN): string => convert.schema.md.dumps(schema)
  // [SchemaFormats.PDF]: (schema: SchemaSimpleJADN): string => convert.schema.pdf.dumps(schema),
};

// App Updater
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// App Window Setup
let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('source-map-support').install();
} else if (isDevelopment || process.env.DEBUG_PROD === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-debug')();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const installExtensions = async (): Promise<void|any[]> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

// Window Creation
const createMainWindow = async (): Promise<void> => {
  if (isDevelopment || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }
  // Set WebPreferences
  const webPreferences: WebPreferences = {
    enableRemoteModule: false
  };
  if (isDevelopment || process.env.E2E_BUILD === 'true') {
    webPreferences.nodeIntegration = true;
  } else {
    webPreferences.preload = path.join(__dirname, 'renderer.prod.js');
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    show: false,
    webPreferences
  });

  // Load content
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();

      // Open the DevTools automatically if developing
      if (isDevelopment) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Build and add app menu
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/* Add event listeners... */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create main BrowserWindow when electron is ready
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('ready', createMainWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Recent Documents action `Open`
app.on('open-file', (_, filePath) => {
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
interface Args {
  format: SchemaFormats;
  schema: SchemaSimpleJADN;
}

const convertSchema = (args: Args): string => {
  const schema = args.schema || {};
  const format = args.format || 'NULL';

  if (Object.values(SchemaFormats).includes(format)) {
    try {
      return schemaConverters[format](schema);
    } catch (err) {
      const e = err.toString();
      if ([SchemaFormats.JADN, SchemaFormats.JSON].includes(format)) {
        const idx = e.indexOf(':');
        const splits = [e.slice(0, idx), e.slice(idx + 1)];
        return `{"${splits[0]}":"${splits[1].trim()}"}`;
      }
      return e;
    }
  }
  return '';
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

ipcMain.handle('convert-schema', (_, args: Args) => convertSchema(args));
