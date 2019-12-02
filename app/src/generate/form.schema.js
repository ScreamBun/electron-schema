// Regex
const NSID = '^[A-Za-z][A-Za-z0-9]{0,7}$'
const TypeName = '^[A-Z][-$A-Za-z0-9]{0,31}$'
const FieldName = '^[a-z][_A-Za-z0-9]{0,31}$'

// Schemas
const MetaData =  {
  root: {
    'title': 'Metadata',
    'type': 'object',
    'required': [
      'module'
    ],
    'properties': {
      'module': {
        '$ref': '#/definitions/MetaData/Namespace',
        'description': 'Unique name/version'
      },
      'patch': {
        'type': 'string',
        'description': 'Patch version',
        'minLength': 1
      },
      'title': {
        'type': 'string',
        'description': 'Title',
        'minLength': 1
      },
      'description': {
        'type': 'string',
        'description': 'Description',
        'minLength': 1
      },
      'imports': {
        '$ref': '#/definitions/MetaData/Imports',
        'description': 'Imported schema modules'
      },
      'exports': {
        '$ref': '#/definitions/MetaData/Exports',
        'description': 'Type definitions exported by this module'
      },
      'config': {
        '$ref': '#/definitions/MetaData/Config',
        'description': 'Configuration values for this module'
      }
    }
  },
  definitions: {
    'Namespace': {
      'type': 'string',
      'format': 'uri'
    },
    'Imports': {
      'type': 'array',
      'description': 'List of imported modules',
      'minimum': 1,
      'items': {
        'type': 'object',
        'required': ['key', 'value'],
        'properties': {
          'key': {
            'type': 'string',
            'format': NSID
          },
          'value': {
            '$ref': '#/definitions/MetaData/Namespace'
          }
        }
      }
     },
    'Exports': {
      'type': 'array',
      'description': 'List of type definitions intended to be public',
      'items': {
        '$ref': '#/definitions/TypeData/TypeName'
      }
    },
    'Config': {
      'type': 'object',
      'description': 'Configuration variables used to override JADN defaults',
      'minProperties': 1,
      'properties': {
        '$MaxBinary': {
          'type': 'integer',
          'description': 'Schema default maximum number of octets',
          'minimum': 1
        },
        '$MaxString': {
          'type': 'integer',
          'description': 'Schema default maximum number of characters',
          'minimum': 1
        },
        '$MaxElements': {
          'type': 'integer',
          'description': 'Schema default maximum number of items/properties',
          'minimum': 1
        },
        '$FS': {
          'type': 'string',
          'description': 'Field Separator character used in pathnames',
          'minLength': 1,
          'maxLength': 1
        },
        '$Sys': {
          'type': 'string',
          'description': 'System character for TypeName',
          'minLength': 1,
          'maxLength': 1
        },
        '$TypeName': {
          'type': 'string',
          'description': 'TypeName regex',
          'minLength': 1,
          'maxLength': 127
        },
        '$FieldName': {
          'type': 'string',
          'description': 'FieldName regex',
          'minLength': 1,
          'maxLength': 127
        },
        '$NSID': {
          'type': 'string',
          'description': 'Namespace Identifier regex',
          'minLength': 1,
          'maxLength': 127
        }
      }
    }
  }
}

const TypeData = {
  root: {
    'title': 'Types',
    'description': 'type definitions for the schema',
    'type': 'array',
    'items': {
      '$ref': '#/definitions/TypeData/TypeDefinition',
    }
  },
  definitions: {
    'BaseTypes': {
      'type': 'string',
      'description': '',
      'oneOf': [
        {
          'const': 'Binary',
          'description': 'A sequence of octets. Length is the number of octets'
        },
        {
          'const': 'Boolean',
          'description': 'An element with one of two values: true or false'
        },
        {
          'const': 'Integer',
          'description': 'A positive or negative whole number'
        },
        {
          'const': 'Number',
          'description': 'A real number'
        },
        {
          'const': 'Null',
          'description': 'An unspecified or non-existent value, distinguishable from other values such as empty String or Array'
        },
        {
          'const': 'String',
          'description': 'A sequence of characters, each of which has a Unicode codepoint. Length is the number of characters'
        },
        {
          'const': 'Enumerated',
          'description': 'One value selected from a set of named or labeled integers'
        },
        {
          'const': 'Choice',
          'description': 'One key and value selected from a set of named or labeled fields. The key has an id and name or label, and is mapped to a type'
        },
        {
          'const': 'Array',
          'description': 'An ordered list of labeled fields with positionally-defined semantics. Each field has a position, label, and type'
        },
        {
          'const': 'ArrayOf',
          'description': 'An ordered list of fields with the same semantics. Each field has a position and type vtype'
        },
        {
          'const': 'Map',
          'description': '	An unordered map from a set of specified keys to values with semantics bound to each key. Each key has an id and name or label, and is mapped to a type'
        },
        {
          'const': 'MapOf',
          'description': 'An unordered map from a set of keys of the same type to values with the same semantics. Each key has key type ktype, and is mapped to value type vtype'
        },
        {
          'const': 'Record',
          'description': 'An ordered map from a list of keys with positions to values with positionally-defined semantics. Each key has a position and name, and is mapped to a type. Represents a row in a spreadsheet or database table'
        }
      ]
    },
    'TypeName': {
      'type': 'string',
      'pattern': TypeName
    },
    'Field': {
      'properties': {
        'fieldID': {
          'type': 'integer'
        },
        'fieldName': {
          'type': 'string'
        },
        'typeRef': {
          'type': 'string'
        },
        'options': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'description': {
          'type': 'string'
        }
      }
    },
    'Item': {
      'properties': {
        'fieldID': {
          'type': 'integer'
        },
        'value': {
          'type': ['integer', 'string']
        },
        'description': {
          'type': 'string'
        }
      }
    },
    'TypeDefinition': {
      'type': 'object',
      'description': 'Type definition',
      'required': ['typeName', 'baseType'],
      'properties': {
        'typeName': {
          '$ref': '#/definitions/TypeData/TypeName'
        },
        'baseType': {
          '$ref': '#/definitions/TypeData/BaseTypes'
        },
        'options': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'description': {
          'type': 'string'
        },
        'fields': {
          'type': 'array',
          'items': {
            'oneOf': [
              {
                'title': 'Field',
                '$ref': '#/definitions/TypeData/Field'
              },
              {
                'title': 'Enum Field',
                '$ref': '#/definitions/TypeData/Item'
              }
            ]
          }
        }
      },
      'dependencies': {
        'baseType': {
          'oneOf': [
            {
              'baseType': {
                '$ref': '#/definitions/TypeData/BaseTypes',
                'enum': ['Binary', 'Boolean', 'Integer', 'Number', 'Null', 'String', 'ArrayOf', 'MapOf']
              }
            },
            {
              'baseType': {
                '$ref': '#/definitions/TypeData/BaseTypes',
                'enum': ['Enumerated']
              },
              'fields': {
                'type': 'array',
                'items': {
                  '$ref': '#/definitions/TypeData/Item'
                }
              }
            },
            {
              'baseType': {
                '$ref': '#/definitions/TypeData/BaseTypes',
                'enum': ['Choice', 'Array', 'Map', 'Record']
              },
              'fields': {
                'type': 'array',
                'items': {
                  '$ref': '#/definitions/TypeData/Field'
                }
              }
            }
          ]
        }
      }
    }
  }
}

const dataSchema = {
  'title': 'Schema Editor',
  'type': 'object',
  'required': [
    //'meta',
    'types'
  ],
  'properties': {
    //'meta': MetaData.root,
    'types': TypeData.root
  },
  'definitions': {
    //'MetaData': MetaData.definitions,
    'TypeData': TypeData.definitions
  }
}

const uiSchema = {
  // General

  // Specific
}

export {
  dataSchema,
  uiSchema
}