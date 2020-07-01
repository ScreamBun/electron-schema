import React from 'react';
import {
  PrimitiveEditor,
  StructureEditor
} from './editors';
import { PrimitiveDef, StructureDef } from './interfaces';

interface EditorProps {
  key?: number|string|undefined;
  dataIndex: number,
  value: Array<any>,
  change?: (val: string|Record<string, any>, idx: number) => void;
  remove?: (idx: number) => void;
};

const typeDef = (props: StructureDef) => {
  const {
    name = 'name',
    type = 'type',
    options = [],
    comment = '',
    fields = []
  } = props;
  return [name, type, options, comment, fields];
};

const primDef = (props: PrimitiveDef) => {
  const {
    name = 'name',
    type = 'type',
    options = [],
    comment = ''
  } = props;
  return [name, type, options, comment];
};

// JADN Types Structure
export default {
  // Structured Types
  record: {
    key: 'Record',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Record' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  enumerated: {
    key: 'Enumerated',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Enumerated' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  choice: {
    key: 'Choice',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Choice' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  map: {
    key: 'Map',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Map' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  mapof: {
    key: 'MapOf',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'MapOf' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'structure'
  },
  array: {
    key: 'Array',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Array' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  arrayof: {
    key: 'ArrayOf',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'ArrayOf' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'structure'
  },
  // Primitive Types
  binary: {
    key: 'Binary',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Binary' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  boolean: {
    key: 'Boolean',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Boolean' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  integer: {
    key: 'Integer',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Integer' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  number: {
    key: 'Number',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Number' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  // null
  string: {
    key: 'String',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'String' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  }
};
