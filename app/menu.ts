import {
  app,
  shell,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions
} from 'electron';
import contextMenu from 'electron-context-menu';
import { SchemaFormats } from 'jadnschema';
import { openFile, newSchema, webContentsSave } from './jadn';
import { safeGet, updateMerge } from './src/utils';

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
    if (isMac) {
      return [
        this.menuAbout(),
        this.menuFile(),
        this.menuEdit(),
        this.menuView(),
        this.menuWindow(),
        this.menuHelp()
      ];
    }
    return [
      this.menuFile(),
      this.menuEdit(),
      this.menuView(),
      this.menuHelp()
    ];
  }

  // Menu Methods
  // eslint-disable-next-line class-methods-use-this
  menuAbout(): DarwinMenuItemConstructorOptions {
    return {
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
  }

  // eslint-disable-next-line class-methods-use-this
  menuFile(): MenuItemConstructorOptions {
    const acceleratorKey = isMac ? 'Command' : 'Ctrl';
    const menu: MenuItemConstructorOptions = {
      label: '&File',
      submenu: [
        {
          label: '&New',
          accelerator: `${acceleratorKey}+N`,
          click: (): void => newSchema(this.mainWindow)
        },
        {
          label: '&Open',
          accelerator: `${acceleratorKey}+O`,
          click: (): void => openFile(this.mainWindow)
        },
        {
          label: '&Save',
          accelerator: `${acceleratorKey}+S`,
          click: (): void => this.mainWindow.webContents.send('file-save', {})
        },
        { type: 'separator' },
        {
          label: 'Export As',
          submenu: [
            {
              label: 'JADN Schema',
              click: (): void => webContentsSave(this.mainWindow, SchemaFormats.JADN)
            },
            {
              label: 'JSON Schema',
              click: (): void => webContentsSave(this.mainWindow, SchemaFormats.JSON)
            },
            {
              label: 'HTML',
              click: (): void => webContentsSave(this.mainWindow, SchemaFormats.HTML)
            },
            {
              label: 'MarkDown',
              click: (): void => webContentsSave(this.mainWindow, SchemaFormats.MarkDown)
            }
            /*
            {
              label: 'PDF',
              click: (): void => webContentsSave(this.mainWindow, SchemaFormats.PDF)
            }
            */
          ]
        }
      ]
    };
    if (isWin) {
      menu.submenu.push(
        { type: 'separator' },
        {
          label: '&Close',
          accelerator: `${acceleratorKey}+W`,
          click: (): void => this.mainWindow.close()
        }
      );
    }
    return menu;
  }

  // eslint-disable-next-line class-methods-use-this
  menuEdit(): DarwinMenuItemConstructorOptions|MenuItemConstructorOptions {
    const acceleratorKey = isMac ? 'Command' : 'Ctrl';
    const menu: DarwinMenuItemConstructorOptions|MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: `${acceleratorKey}+Z`
        },
        {
          label: 'Redo',
          accelerator: `Shift+${acceleratorKey}+Z`
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: `${acceleratorKey}+X`
        },
        {
          label: 'Copy',
          accelerator: `${acceleratorKey}+C`
        },
        {
          label: 'Paste',
          accelerator: `${acceleratorKey}+V`
        },
        {
          label: 'Select All',
          accelerator: `${acceleratorKey}+A`
        }
      ]
    };
    if (isMac) {
      menu.submenu = updateMerge(menu.submenu, [
        { selector: 'undo:' },
        { selector: 'redo:' },
        { },
        { selector: 'cut:' },
        { selector: 'copy' },
        { selector: 'paste:' },
        { selector: 'selectAll:' }
      ]);
    }
    return menu;
  }

  // eslint-disable-next-line class-methods-use-this
  menuView(): MenuItemConstructorOptions {
    const acceleratorKey = isMac ? 'Command' : 'Ctrl';
    const menu: MenuItemConstructorOptions = {
      label: '&View',
      submenu: []
    };
    if (isDebug) {
      menu.submenu = [
        {
          label: 'Reload',
          accelerator: `${acceleratorKey}+R`,
          click: (): void => this.mainWindow.webContents.reload()
        },
        {
          label: 'Toggle &Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: (): void => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: `Alt+${acceleratorKey}+I`,
          click: (): void => this.mainWindow.webContents.toggleDevTools()
        }
      ];
    } else {
      menu.submenu = [
        {
          label: 'Toggle &Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: (): void => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        }
      ];
    }

    return menu;
  }

  // eslint-disable-next-line class-methods-use-this
  menuWindow(): DarwinMenuItemConstructorOptions {
    return {
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
  }

  // eslint-disable-next-line class-methods-use-this
  menuHelp(): MenuItemConstructorOptions {
    return {
      label: 'Help',
      submenu: [
        {
          label: 'JADN Documentation',
          click: (): Promise<void> => shell.openExternal('https://github.com/oasis-tcs/openc2-jadn')
        }
      ]
    };
  }
}
