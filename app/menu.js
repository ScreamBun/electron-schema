import {
  app,
  dialog,
  shell,
  Menu
} from 'electron';
import contextMenu from 'electron-context-menu';
import fs from 'fs';
import {
  safeGet,
  SchemaFormats
} from './src/utils';

const isDevelopment = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';
const isWin = ['win32', 'win64'].includes(process.platform);

export default class MenuBuilder {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);

    this.setupContextMenu();
    Menu.setApplicationMenu(menu);
    return menu;
  }

  setupContextMenu() {
    const isVisible = (params, action) => {
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
        isDevelopment ? actions.inspect() : actions.separator()
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

  buildTemplate() {
    // Mac only menus
    const subMenuAbout = {
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
    const subMenuWindow = {
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

    // Windows only menus

    // Shared menus
    const subMenuFile = {
      label: '&File',
      submenu: [
        {
          label: '&New',
          accelerator: isMac ? 'Command+N' : 'Ctrl+N',
          click: () => this.newSchema()
        },
        {
          label: '&Open',
          accelerator: isMac ? 'Command+O' : 'Ctrl+O',
          click: () => this.openFile()
        },
        {
          label: '&Save',
          accelerator: isMac ? 'Command+S' : 'Ctrl+S',
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
              click: () => this.webContentsSave(SchemaFormats.MD)
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

    if (isWin) {
      subMenuFile.submenu.push(
        { type: 'separator' },
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => this.mainWindow.close()
        }
      );
    }

    const subMenuEdit = {
      label: '&Edit',
      submenu: [
        {
          label: '&Undo',
          accelerator: isMac ? 'Command+Z' : 'Ctrl+Z',
          selector: 'undo:'
        },
        {
          label: '&Redo',
          accelerator: isMac ? 'Shift+Command+Z' : 'Shift+Ctrl+Z',
          selector: 'redo:'
        },
        { type: 'separator' },
        {
          label: '&Cut',
          accelerator: isMac ? 'Command+X' : 'Ctrl+X',
          selector: 'cut:'
        },
        {
          label: '&Copy',
          accelerator: isMac ? 'Command+C' : 'Ctrl+C',
          selector: 'copy:'
        },
        {
          label: '&Paste',
          accelerator: isMac ? 'Command+V' : 'Ctrl+V',
          selector: 'paste:'
        },
        {
          label: '&Select All',
          accelerator: isMac ? 'Command+A' : 'Ctrl+A',
          selector: 'selectAll:'
        }
      ]
    };
    const subMenuViewDev = {
      label: '&View',
      submenu: [
        {
          label: '&Reload',
          accelerator: isMac ? 'Command+R' : 'Ctrl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: isMac ? 'Alt+Command+I' : 'Alt+Ctrl+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle &Full Screen',
          accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
          click: () => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        }
      ]
    };
    const subMenuView = isDevelopment ? subMenuViewDev : subMenuViewProd;

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'JADN Learn More',
          click: () => shell.openExternal('https://github.com/oasis-tcs/openc2-jadn')
        }
      ]
    };

    const menuTemplate = [subMenuFile, subMenuEdit, subMenuView, subMenuHelp];

    if (isMac) {
      menuTemplate.splice(0, 0, subMenuAbout);
      menuTemplate.splice(4, 0, subMenuWindow);
    }

    return menuTemplate;
  }

  webContentsSave(fmt) {
    this.mainWindow.webContents.send('file-save', { format: fmt });
  }

  openFile(file) {
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
          const rslt = { ...result };
          if (!rslt.canceled) {
            app.addRecentDocument(rslt.filePaths[0]);
            try {
              const rawFile = fs.readFileSync(rslt.filePaths[0]);
              rslt.contents = JSON.parse(rawFile);
              this.mainWindow.webContents.send('file-open', rslt);
            } catch (err) {
              dialog.showMessageBoxSync(this.mainWindow, {
                type: 'error',
                title: 'Open Error',
                detail: 'DETAILS -> TBD...'
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
