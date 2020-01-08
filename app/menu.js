// @flow
import { app, dialog, shell, BrowserWindow, Menu } from 'electron'
import fs from 'fs-extra'

import { SchemaFormats } from './src/utils'

const isDevelopment = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'
const isWin = ['win32', 'win64'].includes(process.platform)

export default class MenuBuilder {
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu() {
    if (isDevelopment || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
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
          accelerator: isMac ? 'Command+O': 'Ctrl+O',
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
              click: () => this.mainWindow.webContents.send('file-save', {format: SchemaFormats.JADN})
            },
            {
              label: '&JSON Schema',
              click: () => this.mainWindow.webContents.send('file-save', {format: SchemaFormats.JSON})
            },
            {
              label: '&HTML',
              click: () => this.mainWindow.webContents.send('file-save', {format: SchemaFormats.HTML})
            },
            {
              label: '&MarkDown',
              click: () => this.mainWindow.webContents.send('file-save', {format: SchemaFormats.MD})
            }/*,
            {
              label: '&PDF',
              click: () => this.mainWindow.webContents.send('file-save', {format: SchemaFormats.PDF})
            }*/
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
      )
    }

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
          label: 'Learn More',
          click: () => shell.openExternal('http://electron.atom.io')
        },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme')
        },
        {
          label: 'Community Discussions',
          click: () => shell.openExternal('https://discuss.atom.io/c/electron')
        },
        {
          label: 'Search Issues',
          click: () => shell.openExternal('https://github.com/atom/electron/issues')
        }
      ]
    };

    if (isMac) {
      return [subMenuAbout, subMenuFile, subMenuView, subMenuWindow, subMenuHelp];
    } else {
      return [subMenuFile, subMenuView, subMenuHelp];
    }
  }

  openFile(file) {
    if (file) {
      console.log(file)
    } else {
      dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: app.getPath('documents'),
        filters: [
          { name: 'Default', extensions: ['jadn'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          app.addRecentDocument(result.filePaths[0])
          fs.readJson(result.filePaths[0], (err, packageObj) => {
            if (err){
              dialog.showMessageBoxSync(this.mainWindow, {
                type: 'error',
                title: 'Open Error',
                detail: 'DETAILS -> TBD...'
              })
              console.error(err)
            } else {
              result.contents = packageObj
              this.mainWindow.webContents.send('file-open', result)
            }
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }

  newSchema() {
    const buttons = ['Cancel', 'Erase', 'Save']
    const rslt = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'question',
      buttons: buttons,
      title: 'New Schema',
      message: 'Start a new schema?'
    })
    if (rslt != 0) {
      let result = {
        action: buttons[rslt].toLowerCase()
      }
      this.mainWindow.webContents.send('schema-new', result)
    }
  }

  recentDocuments() {
    if (false) {
      // limit 10...
      return []
    }

    return [{
      key: 'null',
      label: 'No Recent Schemas',
      enabled: false
    }]
  }
}