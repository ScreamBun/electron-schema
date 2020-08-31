import path from 'path';
import { app } from 'electron';
import ElectronPreferences from 'electron-preferences';

const isDebug = process.env.NODE_ENV !== 'production' || process.env.DEBUG_PROD === 'true';
const dataDir = isDebug ? __dirname : app.getPath('userData');
const defResolverDir = path.resolve(app.getPath('documents'), 'Resolver');
if (isDebug) {
  console.log(`DataDir: ${dataDir}`);
}

export interface Preferences {
  resolver: {
    folder: string;
  }
}

export default new ElectronPreferences({
  // Where should preferences be saved?
  'dataStore': path.resolve(dataDir, 'preferences.json'),
  // Default values
  'defaults': {
    'resolver': {
      'folder': defResolverDir
    }
  },
  /**
    * If the `onLoad` method is specified, this function will be called immediately after
    * preferences are loaded for the first time. The return value of this method will be stored as the
    * preferences object.
    */
  'onLoad': (prefs: Preferences) => {
    return prefs;
  },
  /**
    * The preferences window is divided into sections. Each section has a label, an icon, and one or
    * more fields associated with it. Each section should also be given a unique ID.
    */
  'sections': [
    {
      'id': 'resolve',
      'label': 'Resolve',
      'icon': 'folder-15',
      'form': {
        'groups': [
          {
            'label': 'Resolver Locations',
            'fields': [
              {
                'label': 'Read schemas from folder',
                'key': 'folder',
                'type': 'directory',
                'help': 'The location where the resolver will store/load schemas.'
              },
              {
                'heading': 'Important Message',
                'content': `Default path: ${defResolverDir}`,
                'type': 'message',
              }
            ]
          }
        ]
      }
    }
  ]
});