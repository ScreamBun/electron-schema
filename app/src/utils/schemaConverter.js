/*
 Converter scripts for JADNSchema library
*/
export const SchemaFormats = {
  HTML: 'html',
  // JADN: 'jadn',
  // JIDL: 'jidl',
  JSON: 'json',
  MD: 'md',
}

export const ConverterScript = `import json
from jadnschema import (convert, jadn, schema as jadn_schema, CommentLevels)

def load_schema(schema: str) -> dict:
    schema = json.loads(schema)
    return jadn_schema.Schema(schema)

def convert2html(schema: str) -> dict:
    return convert.html_dumps(load_schema(schema))

def convert2json(schema: str) -> dict:
    return convert.json_dumps(load_schema(schema), comm=CommentLevels.ALL)

def convert2md(schema: str) -> str:
    return convert.md_dumps(load_schema(schema))
`;
