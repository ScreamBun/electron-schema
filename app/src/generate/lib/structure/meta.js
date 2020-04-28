import React from 'react';
import {
  ConfigObjectEditor,
  KeyArrayEditor,
  KeyObjectEditor,
  KeyValueEditor
} from './editors';

const metaDef = ({ k = 'key', v = '' }) => ({ [k]: v });

// JADN Meta Structure
export default {
  title: {
    key: 'Title',
    edit: val => metaDef({ k: 'title', v: val }),
    editor: ({ ...props }) => <KeyValueEditor id="Title" {...props} />
  },
  description: {
    key: 'Description',
    edit: val => metaDef({ k: 'description', v: val }),
    editor: ({ ...props }) => <KeyValueEditor id="Description" {...props} />
  },
  module: {
    key: 'Module',
    edit: val => metaDef({ k: 'module', v: val }),
    editor: ({ ...props }) => (
      <KeyValueEditor
        id="Module"
        description="Unique name/version"
        {...props}
      />
    )
  },
  patch: {
    key: 'Patch',
    edit: val => metaDef({ k: 'patch', v: val }),
    editor: ({ ...props }) => <KeyValueEditor id="Patch" {...props} />
  },
  imports: {
    key: 'Imports',
    edit: (val = {}) => metaDef({ k: 'imports', v: val }),
    editor: ({ ...props }) => (
      <KeyObjectEditor
        id="Imports"
        description="Imported schema modules"
        {...props}
      />
    )
  },
  exports: {
    key: 'Exports',
    edit: (val = []) => metaDef({ k: 'exports', v: val }),
    editor: ({ ...props }) => (
      <KeyArrayEditor
        id="Exports"
        description="Type definitions exported by this module"
        {...props}
      />
    )
  },
  config: {
    key: 'Config',
    edit: (val = {}) => metaDef({ k: 'config', v: val }),
    editor: ({ ...props }) => (
      <ConfigObjectEditor
        id="Config"
        description="Configuration values for this module"
        {...props}
      />
    )
  }
};
