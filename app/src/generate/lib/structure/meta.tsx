import React from 'react';
import {
  ConfigObjectEditor,
  KeyArrayEditor,
  KeyObjectEditor,
  KeyValueEditor
} from './editors';
import { MetaDef } from './interfaces';

interface EditorProps {
  key?: number|string|undefined;
  id?: string;
  description?: string;
  placeholder: string;
  value: any;
  change?: (val: string|Record<string, any>, idx: number) => void;
  remove?: (idx: number) => void;
};

const metaDef = ({ k = 'key', v = '' }: MetaDef) => ({ [k]: v } as Record<string, any>);

// JADN Meta Structure
export default {
  title: {
    key: 'Title',
    edit: (val: string) => metaDef({ k: 'title', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor id="Title" {...props} />
  },
  description: {
    key: 'Description',
    edit: (val: string) => metaDef({ k: 'description', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor id="Description" {...props} />
  },
  module: {
    key: 'Module',
    edit: (val: string) => metaDef({ k: 'module', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor
        id="Module"
        description="Unique name/version"
        { ...props }
      />
    )
  },
  patch: {
    key: 'Patch',
    edit: (val: string) => metaDef({ k: 'patch', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor id="Patch" {...props} />
  },
  imports: {
    key: 'Imports',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'imports', v: val }),
    editor: (props: EditorProps) => (
      <KeyObjectEditor
        id="Imports"
        description="Imported schema modules"
        {...props}
      />
    )
  },
  exports: {
    key: 'Exports',
    edit: (val: Array<string> = []) => metaDef({ k: 'exports', v: val }),
    editor: (props: EditorProps) => (
      <KeyArrayEditor
        id="Exports"
        description="Type definitions exported by this module"
        { ...props }
      />
    )
  },
  config: {
    key: 'Config',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'config', v: val }),
    editor: (props: EditorProps) => (
      <ConfigObjectEditor
        id="Config"
        description="Configuration values for this module"
        { ...props }
      />
    )
  }
};
