// JADN Utility Functions

const jadnDump = ({ schema, indent = 2, level = 0 }) => {
  let ind = indent % 2 === 1 ? indent - 1 : indent;
  ind += level * 2;
  const indNor = ' '.repeat(ind);
  const indNes = ' '.repeat(ind - 2);

  switch (typeof schema) {
    case 'object':
      if (Array.isArray(schema)) {
        const nested = schema && typeof schema[0] === 'object' && Array.isArray(schema[0]);
        const lvl = nested && typeof schema[-1] === 'object' && Array.isArray(schema[-1]) ? level + 1 : level;
        let lines = schema.map(idx => jadnDump({schema: idx, indent, level: lvl}));
        if (nested) {
          lines = lines.join(`,\n${indNor}`);
          return `[\n${indNor}${lines}\n${indNes}]`;
        }
        return `[${lines.join(', ')}]`;
      }
      const lines = Object.keys(schema).map(k => `${indNor}"${k}": ${jadnDump({schema: schema[k], indent, level: level + 1})}`);
      return `{\n${lines.join(',\n')}\n${indNes}}`;
    case 'number':
    case 'string':
      return JSON.stringify(schema);
    default:
      console.log(`${typeof schema} - ${schema}`);
      return '???';
  }
};

export const jadnFormat = jadn => jadnDump({ schema: jadn });
