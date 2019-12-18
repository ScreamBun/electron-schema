import React from 'react'

import {
  PrimitiveEditor,
  StructureEditor
} from './editors'

const typeDef = ({name='name', type='type', options=[], comment='', fields=[]}) => ([name, type, options, comment, fields])

const primDef = ({name='name', type='type', options=[], comment=''}) => ([name, type, options, comment]);

// JADN Types Structure
export default {
  //Structured Types
  record: {
    key: 'Record',
    edit: ({name='record', options, comment, fields, ...rest}={}) => typeDef({name, type: 'Record', options, comment, fields}),
    editor: ({...props}) => <StructureEditor {...props} />,
    type: 'structure'
  },
  enumerated: {
    key: 'Enumerated',
    edit: ({name='enumerated', options, comment, fields, ...rest}={}) => typeDef({name, type: 'Enumerated', options, comment, fields}),
    editor: ({...props}) => <StructureEditor {...props} />,
    type: 'structure'
  },
  choice: {
    key: 'Choice',
    edit: ({name='choice', options, comment, fields, ...rest}={}) => typeDef({name, type: 'Choice', options, comment, fields}),
    editor: ({...props}) => <StructureEditor {...props} />,
    type: 'structure'
  },
  map: {
    key: 'Map',
    edit: ({name='map', options, comment, fields, ...rest}={}) => typeDef({name, type: 'Map', options, comment, fields}),
    editor: ({...props}) => <StructureEditor {...props} />,
    type: 'structure'
  },
  mapof: {
    key: 'MapOf',
    edit: ({name='mapof', options, comment, fields, ...rest}={}) => typeDef({name, type: 'MapOf', options, comment, fields}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'structure'
  },
  array: {
    key: 'Array',
    edit: ({name='array', options, comment, fields, ...rest}={}) => typeDef({name, type: 'Array', options, comment, fields}),
    editor: ({...props}) => <StructureEditor {...props} />,
    type: 'structure'
  },
  arrayof: {
    key: 'ArrayOf',
    edit: ({name='arrayof', options, comment, fields, ...rest}={}) => typeDef({name, type: 'ArrayOf', options, comment, fields}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'structure'
  },
  //Primitive Types
  binary: {
    key: 'Binary',
    edit: ({name='binary', options, comment, ...rest}={}) => primDef({name, type: 'Binary', options, comment}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'primitive'
  },
  boolean: {
    key: 'Boolean',
    edit: ({name='boolean', options, comment, ...rest}={}) => primDef({name, type: 'Boolean', options, comment}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'primitive'
  },
  integer: {
    key: 'Integer',
    edit: ({name='integer', options, comment, ...rest}={}) => primDef({name, type: 'Integer', options, comment}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'primitive'
  },
  number: {
    key: 'Number',
    edit: ({name='number', options, comment, ...rest}={}) => primDef({name, type: 'Number', options, comment}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'primitive'
  },
  // null
  string: {
    key: 'String',
    edit: ({name='string', options, comment, ...rest}={}) => primDef({name, type: 'String', options, comment}),
    editor: ({...props}) => <PrimitiveEditor {...props} />,
    type: 'primitive'
  },
}