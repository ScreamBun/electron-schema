import React from 'react';
import {
  ConfigObjectEditor, KeyArrayEditor, KeyObjectEditor, KeyValueEditor
} from './editors';
import { InfoDef } from './interfaces';

interface EditorProps {
  key?: number|string|undefined;  // eslint-disable-line react/require-default-props
  id: string;
  description?: string;  // eslint-disable-line react/require-default-props
  placeholder: string;
  value: any;
  change?: (val: string|Record<string, any>, idx: number) => void;  // eslint-disable-line react/require-default-props
  remove?: (idx: number) => void;  // eslint-disable-line react/require-default-props
};

const metaDef = ({ k = 'key', v = '' }: InfoDef) => ({ [k]: v } as Record<string, any>);

// JADN Info Structure
export default {
  module: {
    key: 'Module',
    edit: (val: string) => metaDef({ k: 'module', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor
        { ...props }
        id="Module"
        description="Unique name/version"
      />
    )
  },
  version: {
    key: 'Version',
    edit: (val: string) => metaDef({ k: 'version', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } id="Version" />
  },
  title: {
    key: 'Title',
    edit: (val: string) => metaDef({ k: 'title', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } id="Title" />
  },
  description: {
    key: 'Description',
    edit: (val: string) => metaDef({ k: 'description', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } id="Description" />
  },
  comment: {
    key: 'Comment',
    edit: (val: string) => metaDef({ k: 'comment', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } id="Comment" />
  },
  copyright: {
    key: 'Copyright',
    edit: (val: string) => metaDef({ k: 'copyright', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } id="Copyright" />
  },
  license: {
    key: 'License',
    edit: (val: string) => metaDef({ k: 'license', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } id="License" />
  },
  imports: {
    key: 'Imports',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'imports', v: val }),
    editor: (props: EditorProps) => (
      <KeyObjectEditor
        { ...props }
        id="Imports"
        description="Imported schema modules"
      />
    )
  },
  exports: {
    key: 'Exports',
    edit: (val: Array<string> = []) => metaDef({ k: 'exports', v: val }),
    editor: (props: EditorProps) => (
      <KeyArrayEditor
        { ...props }
        id="Exports"
        description="Type definitions exported by this module"
      />
    )
  },
  config: {
    key: 'Config',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'config', v: val }),
    editor: (props: EditorProps) => (
      <ConfigObjectEditor
        { ...props }
        id="Config"
        description="Configuration values for this module"
      />
    )
  }
};
