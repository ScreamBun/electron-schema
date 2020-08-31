// Constant Tokens
import { MarkupToken } from './interfaces';

export const JADN_TYPES = [
  // Simple
  'Binary',  // A sequence of octets. Length is the number of octets.
  'Boolean',  // An element with one of two values: true or false.
  'Integer',  // A positive or negative whole number.
  'Number',  // A real number.
  'Null',  // An unspecified or non-existent value, distinguishable from other values such as zero-length String or empty Array.
  'String',  // A sequence of characters, each of which has a Unicode codepoint. Length is the number of characters.
  // Selector
  'Enumerated',  // One id and string value selected from a vocabulary.
  'Choice',  // A discriminated union: one type selected from a set of named or labeled types.
  // Container
  'Array',  // An ordered list of labeled fields with positionally-defined semantics. Each field has a position, label, and type.
  'ArrayOf',  // An ordered list of fields with the same semantics. Each field has a position and type vtype.
  'Map',  // An unordered map from a set of specified keys to values with semantics bound to each key. Each key has an id and name or label, and is mapped to a value type.
  'MapOf',  // An unordered map from a set of keys of the same type to values with the same semantics. Each key has key type ktype, and is mapped to value type vtype.
  'Record' // An ordered map from a list of keys with positions to values with positionally-defined semantics. Each key has a position and name, and is mapped to a value type. Represents a row in a spreadsheet or database table.
];

export const BREAK: MarkupToken = {
  type: 'linebreak',
  string: '\n',
  value: '\n'
};

export const SPACE: MarkupToken = {
  type: 'space',
  string: ' ',
  value: ' '
};

export const COMMENT: MarkupToken = {
  type: 'symbol',
  string: '// ',
  value: '//'
};

export const EQUALS: MarkupToken = {
  type: 'symbol',
  string: ' = ',
  value: '='
};
