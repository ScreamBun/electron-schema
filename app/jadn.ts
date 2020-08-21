import fs from 'fs';
import {
  app, dialog, ipcMain, BrowserWindow
} from 'electron';
import { convert, SchemaFormats } from 'jadnschema';
import { SchemaSimpleJADN } from 'jadnschema/lib/jadnschema/schema/interfaces';

// JADN Setup
const schemaConverters = {
  [SchemaFormats.HTML]: (schema: SchemaSimpleJADN): string => convert.schema.html.dumps(schema),
  [SchemaFormats.JADN]: (schema: SchemaSimpleJADN): string => convert.schema.jadn.dumps(schema),
  [SchemaFormats.JIDL]: (schema: SchemaSimpleJADN): string => convert.schema.jidl.dumps(schema),
  [SchemaFormats.JSON]: (schema: SchemaSimpleJADN): string => convert.schema.json.dumps(schema),
  [SchemaFormats.MarkDown]: (schema: SchemaSimpleJADN): string => convert.schema.md.dumps(schema)
  // [SchemaFormats.PDF]: (schema: SchemaSimpleJADN): string => convert.schema.pdf.dumps(schema),
};

interface Args {
  format: SchemaFormats;
  schema: SchemaSimpleJADN;
  contents?: string;
  filePath?: string;
}

interface Results {
  canceled: boolean;
  filePath: string;
}

// Renderer event actions
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

// App Actions
export const actionsJADN = (mainWindow: BrowserWindow): void => {
  app.on('open-file', (_, filePath: string) => {
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

  ipcMain.on('file-save', (event, args: Args) => {
    const kargs = { contents: '', filePath: '', ...args };
    const ext = kargs.format ||  SchemaFormats.JADN;
    kargs.filePath = `${kargs.filePath.substr(0, kargs.filePath.lastIndexOf('.'))}.${ext}`;

    dialog
      .showSaveDialog(mainWindow, {
        title: 'Save Schema',
        defaultPath: kargs.filePath || app.getPath('documents'),
        filters: [{ name: 'Schema Format', extensions: [ext] }]
      })
      .then(result => {
        const rslt = result as Results;
        if (!rslt.canceled) {
          kargs.filePath = rslt.filePath;
          const contents = convertSchema({ format: ext, schema: kargs.contents });

          fs.writeFile(kargs.filePath, contents, (err: Error) => {
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
        return rslt;
      })
      .catch((err: Error) => {
        dialog.showMessageBoxSync(mainWindow, {
          type: 'error',
          title: 'Open Error',
          message: 'DETAILS -> TBD...'
        });
        console.log(err);
      });
  });

  ipcMain.handle('convert-schema', (_, args: Args) => convertSchema(args));
};

// Menu Actions
export const webContentsSave = (mainWindow: BrowserWindow, fmt: SchemaFormats): void => {
  mainWindow.webContents.send('file-save', { format: fmt });
};

export const openFile = (mainWindow: BrowserWindow, file?: string): void => {
  if (file) {
    console.log(file);
  } else {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'Default', extensions: ['jadn'] }]
      })
      .then(result => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rslt: Record<string, any> = { ...result };
        if (!rslt.canceled) {
          app.addRecentDocument(rslt.filePaths[0]);
          try {
            const rawFile = fs.readFileSync(rslt.filePaths[0]).toString();
            rslt.contents = JSON.parse(rawFile);
            mainWindow.webContents.send('file-open', rslt);
          } catch (err) {
            dialog.showMessageBoxSync(mainWindow, {
              type: 'error',
              title: 'Open Error',
              message: 'DETAILS -> TBD...'
            });
            console.error(err);
          }
        }
        return rslt;
      })
      .catch(err => {
        console.log(err);
      });
  }
};

export const newSchema = (mainWindow: BrowserWindow): void => {
  const buttons = ['Cancel', 'Erase', 'Save'];
  const rslt = dialog.showMessageBoxSync(mainWindow, {
    type: 'question',
    buttons,
    title: 'New Schema',
    message: 'Start a new schema?'
  });
  if (rslt !== 0) {
    const result = {
      action: buttons[rslt].toLowerCase()
    };
    mainWindow.webContents.send('schema-new', result);
  }
};