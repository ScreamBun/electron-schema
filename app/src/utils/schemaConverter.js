/*
 Converter scripts for JADNSchema library
*/
export const SchemaFormats = {
  HTML: 'html',
  JADN: 'jadn',
  // JIDL: 'jidl',
  JSON: 'json',
  MD: 'md',
  // PDF: 'pdf'
}

export const ConverterScript = `import json
from jadnschema import (convert, jadn, schema as jadn_schema)

def load_schema(schema: str) -> dict:
    return jadn.loads(schema)

def convert2html(schema: str) -> dict:
    return convert.html_dumps(load_schema(schema))

def convert2jadn(schema: str) -> str:
    return convert.jadn_dumps(load_schema(schema))

def convert2json(schema: str) -> str:
    return convert.json_dumps(load_schema(schema))

def convert2md(schema: str) -> str:
    return convert.md_dumps(load_schema(schema))
`;
