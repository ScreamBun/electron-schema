
const jadn_dump = ({schema, indent=2, level=0}) => {
  let _indent = (indent % 2) === 1 ? indent - 1 : indent
  _indent += (level * 2)
  let ind = " ".repeat(_indent)
  let ind_e = " ".repeat(_indent - 2)

  switch(typeof(schema)) {
    case 'object':
      if (Array.isArray(schema)) {
        let nested = schema && 'object' == typeof(schema[0]) && Array.isArray(schema[0])
        let lvl = nested && 'object' == typeof(schema[-1]) && Array.isArray(schema[-1]) ? level + 1 : level
        let lines = schema.map(idx => jadn_dump({schema: idx, indent, level: lvl}))
        return nested ? `[\n${ind}` + lines.join(`,\n${ind}`) + `\n${ind_e}]` : `[${lines.join(', ')}]`
      } else {
        let lines = Object.keys(schema).map(k => `${ind}\"${k}\": ${jadn_dump({schema: schema[k], indent, level: level + 1})}`).join(',\n')
        return `{\n${lines}\n${ind_e}}`
      }
    case 'number':
    case 'string':
      return JSON.stringify(schema)
    default:
      console.log(`${typeof(schema)} - ${schema}`)
      return '???'
  }
}

const jadn_format = (jadn) => jadn_dump({ schema: jadn })

export {
  jadn_format
}