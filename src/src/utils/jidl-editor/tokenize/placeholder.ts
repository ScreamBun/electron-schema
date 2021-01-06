/* JS OBJECTS || PLACEHOLDER */
import NamedRegExp from 'named-regexp-groups';
import {
  BREAK, COMMENT, EQUALS, JADN_TYPES, SPACE
} from './consts';
import { PlaceholderTokenize, MarkupToken } from './interfaces';
import { flattenArray, newSpan } from './utils';
import JIDLInput from '../index';

// Interfaces
interface PrimaryBuffer {
  inputText: string;
  tokens: Array<MarkupToken>;
  indentation: string;
  markup: string;
  lines: number
}

// RegExes
const commentReg = new NamedRegExp(/^(:<def>.*?)(?:[^:])\/\/\s+?(:<comment>.*)$/);
const infoReg = new NamedRegExp(/^(:<key>\w+):(:<value>.*)$/);
const headerReg = new NamedRegExp(/^(:<name>[A-Z][$\w-]+)\s+=\s+(:<type>[A-Z][\w-]+)(:<options>.*)?$/);
const genFieldReg = new NamedRegExp(/^(:<id>\d+)\s+(:<name>[a-z][\w-]+)\s+?(:<type>[A-Z][$\w-]+)(:<options>.*)?$/);
const enumFieldReg = new NamedRegExp(/^(:<id>[\d\w-]+)(:<value>.*)?$/);

// Helper Functions
function splitComment(line: string): [string, string] {
  const match = commentReg.exec(line);
  if (match) {
    const { groups } = match;
    return [groups.def.trim(), groups.comment.trim()];
  }
  return [line, ''];
}

function tokenizeOptions(options: string): Array<MarkupToken> {
  const tokens: Array<MarkupToken> = [];

  if (options) {
    // TODO: format options
    tokens.push(
      SPACE,
      {
        type: 'options',
        string: options,
        value: options
      }
    );
  }

  return tokens;
}

function tokenizeInfoLine(line: string): Array<MarkupToken> {
  const match = infoReg.exec(line);
  if (match) {
    const { groups } = match;
    const [key, val] = [groups.key.trim(), groups.value.trim()];
    return [
      {
        type: 'key',
        string: key,
        value: key
      },
      {
        type: 'colon',
        string: ':',
        value: ':'
      },
      SPACE,
      {
        type: 'string',
        string: val,
        value: val
      },
      BREAK
    ];
  }
  console.error(`INFO ERROR - ${line}`);
  return [];
}

function tokenizeDefHeaderLine(line: string): Array<MarkupToken> {
  const tokens: Array<MarkupToken> = [];
  const [def, comm] = splitComment(line);
  const match = headerReg.exec(def);

  if (match) {
    const { groups } = match;
    const [name, type, options] = [groups.name.trim(), groups.type.trim(), (groups.options || '').trim()];
    tokens.push(
      {
        type: 'name',
        string: name,
        value: name
      },
      EQUALS,
      {
        type: JADN_TYPES.includes(type) ? 'primitive' : 'type',
        string: type,
        value: type
      },
      ...tokenizeOptions(options)
    );

    if (comm) {
      tokens.push(
        SPACE,
        COMMENT,
        {
          type: 'string',
          string: comm,
          value: comm
        }
      );
    }
    tokens.push(BREAK);
    return tokens;
  }
  console.error(`Header Def - ${line}`);
  return [];
}

function tokenizeGenFieldLine(line: string): Array<MarkupToken> {
  const tokens: Array<MarkupToken> = [];
  const [def, comm] = splitComment(line);
  const genMatch = genFieldReg.exec(def);

  if (genMatch) {
    const { groups } = genMatch;
    const [id, name, type, options] = [groups.id.trim(), groups.name.trim(), groups.type.trim(), (groups.options || '').trim()];
    tokens.push(
      SPACE,
      {
        type: 'number',
        string: id,
        value: Number(id)
      },
      SPACE,
      {
        type: 'string',
        string: name,
        value: name
      },
      SPACE,
      {
        type: JADN_TYPES.includes(type) ? 'primitive' : 'type',
        string: type,
        value: type
      },
      ...tokenizeOptions(options)
    );

    if (comm) {
      tokens.push(
        SPACE,
        COMMENT,
        {
          type: 'string',
          string: comm,
          value: comm
        }
      );
    }
    tokens.push(BREAK);
    return tokens;
  }
  console.error(`GenLine - ${def}`);
  return [];
}

function tokenizeEnumFieldLine(line: string): Array<MarkupToken> {
  const tokens: Array<MarkupToken> = [];
  const [def, comm] = splitComment(line);
  const enumMatch = enumFieldReg.exec(def);

  if (enumMatch) {
    const { groups } = enumMatch;
    const [id, value] = [groups.id.trim(), (groups.value || '').trim()];
    tokens.push(
      SPACE,
      {
        type: 'number',
        string: id,
        value: Number(id)
      }
    );

    if (value) {
      const isNum = !Number.isNaN(Number(value));
      tokens.push(
        SPACE,
        {
          type: isNum ? 'number' : 'string',
          string: value,
          value: isNum ? Number(value) : value
        }
      );
    }

    if (comm) {
      tokens.push(
        SPACE,
        COMMENT,
        {
          type: 'string',
          string: comm,
          value: comm
        }
      );
    }
    tokens.push(BREAK);
    return tokens;
  }
  console.error(`GenLine - ${def}`);
  return [];
}

function tokenizeDefaultLine(line: string): Array<MarkupToken> {
  const [orig, comm] = splitComment(line);
  const tokens: Array<MarkupToken> = [
    {
      type: 'string',
      string: orig,
      value: orig
    }
  ];

  if (comm) {
    tokens.push(
      SPACE,
      COMMENT,
      {
        type: 'string',
        string: comm,
        value: comm
      }
    );
  }

  tokens.push(BREAK);
  return tokens;
}

// Main Function
// this is temp solution to splitting the class across files
export default function PlaceholderJIDL(this: JIDLInput, jidl: string): PlaceholderTokenize {
  const buffer: PrimaryBuffer = {
    inputText: jidl,
    tokens: [],
    indentation: '',
    markup: '',
    lines: 1
  };

  buffer.tokens = flattenArray(jidl.split('\n').map<Array<MarkupToken>>(l => {
    const line = l.trim();
    switch (true) {
      case infoReg.test(line):
        return tokenizeInfoLine(line);

      case headerReg.test(line):
        return tokenizeDefHeaderLine(line);

      case genFieldReg.test(line):
        return tokenizeGenFieldLine(line);

      case enumFieldReg.test(line):
        return tokenizeEnumFieldLine(line);

      case Boolean(line.match(/^$/)):
        return [BREAK];

      default:
        return tokenizeDefaultLine(line);
    }
  }));

  // FORMAT BY TOKEN!!
  buffer.tokens.forEach((token, idx) => {
    const { string, type } = token;
    buffer.lines += type === 'linebreak' ? 1 : 0;
    const span = newSpan(idx, token, this.colors);

    buffer.indentation += string;
    buffer.markup += span;
  });

  return {
    tokens: buffer.tokens,
    noSpaces: '',
    indented: buffer.indentation,
    json: '',
    jsObject: {},
    markup: buffer.markup,
    lines: buffer.lines
  };
}