import {
  app,
  dialog,
  shell,
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions
} from 'electron';
import contextMenu from 'electron-context-menu';
import fs from 'fs';
import { SchemaFormats } from 'jadnschema';
import { safeGet } from './src/utils';

const isDebug = process.env.NODE_ENV !== 'production' || process.env.DEBUG_PROD === 'true';
const isMac = process.platform === 'darwin';
const isWin = ['win32', 'win64'].includes(process.platform);


export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    this.setupContextMenu();

    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);
    return menu;
  }

  setupContextMenu() {
    const isVisible = (params: Electron.ContextMenuParams, action: string): boolean => {
      let vis = params.isEditable;
      vis = vis && safeGet(params.editFlags, `can${action}`, false);
      vis = vis && this.validInputFields.includes(params.inputFieldType);
      return vis;
    };

    contextMenu({
      append: (actions, params) => [
        actions.separator(),
        actions.copy({
          visible: isVisible(params, 'Copy')
        }),
        actions.paste({
          visible: isVisible(params, 'Paste')
        }),
        actions.separator(),
        isDebug ? actions.inspect() : actions.separator()
      ],
      showCopyImage: false,
      showCopyImageAddress: false,
      showInspectElement: false,
      showLookUpSelection: false,
      showSaveImageAs: false,
      showServices: false,
      menu: () => []
    });
  }

  buildTemplate(): Array<MenuItemConstructorOptions> {
    const menuFile: MenuItemConstructorOptions = {
      label: '&File',
      submenu: [
        {
          label: '&New',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+N`,
          click: () => this.newSchema()
        },
        {
          label: '&Open',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+O`,
          click: () => this.openFile()
        },
        {
          label: '&Save',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+S`,
          click: () => this.mainWindow.webContents.send('file-save', {})
        },
        { type: 'separator' },
        {
          label: 'Export As',
          submenu: [
            {
              label: '&JADN Schema',
              click: () => this.webContentsSave(SchemaFormats.JADN)
            },
            {
              label: '&JSON Schema',
              click: () => this.webContentsSave(SchemaFormats.JSON)
            },
            {
              label: '&HTML',
              click: () => this.webContentsSave(SchemaFormats.HTML)
            },
            {
              label: '&MarkDown',
              click: () => this.webContentsSave(SchemaFormats.MarkDown)
            }
            /*
            {
              label: '&PDF',
              click: () => this.webContentsSave(SchemaFormats.PDF)
            }
            */
          ]
        }
      ]
    };
    const menuEdit: MenuItemConstructorOptions = {
      label: '&Edit',
      submenu: [
        {
          label: '&Undo',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+Z`,
          selector: 'undo:'
        },
        {
          label: '&Redo',
          accelerator: `Shift+${isMac ? 'Command' : 'Ctrl'}+Z`,
          selector: 'redo:'
        },
        { type: 'separator' },
        {
          label: '&Cut',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+X`,
          selector: 'cut:'
        },
        {
          label: '&Copy',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+C`,
          selector: 'copy:'
        },
        {
          label: '&Paste',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+V`,
          selector: 'paste:'
        },
        {
          label: '&Select All',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+A`,
          selector: 'selectAll:'
        }
      ]
    };
    const menuViewDev: MenuItemConstructorOptions = {
      label: '&View',
      submenu: [
        {
          label: '&Reload',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+R`,
          click: () => this.mainWindow.webContents.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: () => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: `Alt+${isMac ? 'Command' : 'Ctrl'}+I`,
          click: () => this.mainWindow.webContents.toggleDevTools()
        }
      ]
    };
    const menuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle &Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: () => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        }
      ]
    };
    const menuView = isDebug ? menuViewDev : menuViewProd;

    const menuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'JADN Learn More',
          click: () => shell.openExternal('https://github.com/oasis-tcs/openc2-jadn')
        }
      ]
    };

    // Mac only options
    if (isMac) {
      const menuAbout: MenuItemConstructorOptions = {
        label: app.name,
        submenu: [
          {
            label: 'About ElectronReact',
            selector: 'orderFrontStandardAboutPanel:'
          },
          { type: 'separator' },
          { label: 'Services', submenu: [] },
          { type: 'separator' },
          {
            label: 'Hide ElectronReact',
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          { label: 'Show All', selector: 'unhideAllApplications:' },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => app.quit()
          }
        ]
      };
      const menuWindow: MenuItemConstructorOptions = {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
          { type: 'separator' },
          { label: 'Bring All to Front', selector: 'arrangeInFront:' }
        ]
      };

      return [menuAbout, menuFile, menuEdit, menuView, menuWindow, menuHelp];
    }

    // Windows only options
    if (isWin) {
      menuFile.submenu.push(
        { type: 'separator' },
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => this.mainWindow.close()
        }
      );
    }

    return [menuFile, menuEdit, menuView, menuHelp];
  }

  webContentsSave(fmt: SchemaFormats) {
    this.mainWindow.webContents.send('file-save', { format: fmt });
  }

  openFile(file?: string) {
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
          const rslt: Record<string, any> = { ...result };
          if (!rslt.canceled) {
            app.addRecentDocument(rslt.filePaths[0]);
            try {
              const rawFile = fs.readFileSync(rslt.filePaths[0]).toString();
              rslt.contents = JSON.parse(rawFile);
              this.mainWindow.webContents.send('file-open', rslt);
            } catch (err) {
              dialog.showMessageBoxSync(this.mainWindow, {
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
  }

  newSchema() {
    const buttons = ['Cancel', 'Erase', 'Save'];
    const rslt = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'question',
      buttons,
      title: 'New Schema',
      message: 'Start a new schema?'
    });
    if (rslt !== 0) {
      const result = {
        action: buttons[rslt].toLowerCase()
      };
      this.mainWindow.webContents.send('schema-new', result);
    }
  }
}
