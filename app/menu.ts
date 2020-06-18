import fs from 'fs';
import {
  app,
  dialog,
  shell,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions
} from 'electron';
import contextMenu from 'electron-context-menu';
import { SchemaFormats } from 'jadnschema';
import { safeGet } from './src/utils';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

const isDebug = process.env.NODE_ENV !== 'production' || process.env.DEBUG_PROD === 'true';
const isMac = process.platform === 'darwin';
const isWin = ['win32', 'win64'].includes(process.platform);

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    this.setupContextMenu();

    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);
    return menu;
  }

  setupContextMenu(): void {
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
        } as contextMenu.ActionOptions),
        actions.paste({
          visible: isVisible(params, 'Paste')
        } as contextMenu.ActionOptions),
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

  buildTemplate(): Array<DarwinMenuItemConstructorOptions|MenuItemConstructorOptions> {
    const menu = this.baseMenu();

    if (isMac) {
      return this.macMenu(menu);
    }
    return menu;
  }

  baseMenu(): Array<DarwinMenuItemConstructorOptions|MenuItemConstructorOptions>{
    const fileMenu: DarwinMenuItemConstructorOptions|MenuItemConstructorOptions = {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+N`,
          click: (): void => this.newSchema()
        },
        {
          label: 'Open',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+O`,
          click: (): void => this.openFile()
        },
        {
          label: 'Save',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+S`,
          click: (): void => this.mainWindow.webContents.send('file-save', {})
        },
        { type: 'separator' },
        {
          label: 'Export As',
          submenu: [
            {
              label: 'JADN Schema',
              click: (): void => this.webContentsSave(SchemaFormats.JADN)
            },
            {
              label: 'JSON Schema',
              click: (): void => this.webContentsSave(SchemaFormats.JSON)
            },
            {
              label: 'HTML',
              click: (): void => this.webContentsSave(SchemaFormats.HTML)
            },
            {
              label: 'MarkDown',
              click: (): void => this.webContentsSave(SchemaFormats.MarkDown)
            }
            /*
            {
              label: '&PDF',
              click: (): void => this.webContentsSave(SchemaFormats.PDF)
            }
            */
          ],
          ...(isWin ? [
            { type: 'separator' },
            {
              label: 'Close',
              accelerator: 'Ctrl+W',
              click: (): void => this.mainWindow.close()
            }
          ] : [])
        }
      ]
    };
    const editMenu: DarwinMenuItemConstructorOptions|MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+Z`,
          ...(isMac ? { selector: 'undo:' } : {})
        },
        {
          label: 'Redo',
          accelerator: `Shift+${isMac ? 'Command' : 'Ctrl'}+Z`,
          ...(isMac ? { selector: 'redo:' } : {})
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+X`,
          ...(isMac ? { selector: 'cut:' } : {})
        },
        {
          label: 'Copy',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+C`,
          ...(isMac ? { selector: 'copy:' } : {})
        },
        {
          label: 'Paste',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+V`,
          ...(isMac ? { selector: 'paste:' } : {})
        },
        {
          label: 'Select All',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+A`,
          ...(isMac ? { selector: 'selectAll:' } : {})
        }
      ]
    };
    const viewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: `${isMac ? 'Command' : 'Ctrl'}+R`,
          click: (): void => this.mainWindow.webContents.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: (): void => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: `Alt+${isMac ? 'Command' : 'Ctrl'}+I`,
          click: (): void => this.mainWindow.webContents.toggleDevTools()
        }
      ]
    };
    const viewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: (): void => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        }
      ]
    };
    const helpMenu = {
      label: 'Help',
      submenu: [
        {
          label: 'JADN Learn More',
          click: (): Promise<void> => shell.openExternal('https://github.com/oasis-tcs/openc2-jadn')
        }
      ]
    };

    return [
      fileMenu,
      editMenu,
      isDebug ? viewDev : viewProd,
      helpMenu
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  macMenu(base: Array<DarwinMenuItemConstructorOptions|MenuItemConstructorOptions>): Array<DarwinMenuItemConstructorOptions|MenuItemConstructorOptions> {
    const aboutMenu: DarwinMenuItemConstructorOptions = {
      label: app.name,
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        {
          label: 'Services',
          submenu: []
        },
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
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: (): void => app.quit()
        }
      ]
    };
    const windowMenu: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }
      ]
    };

    base.splice(0, 0, aboutMenu);
    base.splice(4, 0, windowMenu);
    return base;
  }

  webContentsSave(fmt: SchemaFormats): void {
    this.mainWindow.webContents.send('file-save', { format: fmt });
  }

  openFile(file?: string): void {
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

  newSchema(): void {
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
