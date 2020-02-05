// Converter scripts for JADNSchema library
export const SchemaFormats = {
  HTML: 'html',
  JADN: 'jadn',
  // JIDL: 'jidl',
  JSON: 'json',
  MD: 'md'
  // PDF: 'pdf'
};

export const ConverterScript = String.raw`import json
from jadnschema import (convert, jadn, schema as jadn_schema)

def load_schema(schema: str) -> dict:
    return jadn.loads(schema)

def convert2html(schema: str) -> dict:
    try:
        return convert.html_dumps(load_schema(schema))
    except Exception as e:
        return f"<h1>Conversion Error</h1><h2>{e.__class__.__name__}: {e}</h2>"

def convert2jadn(schema: str) -> str:
    try:
        return convert.jadn_dumps(load_schema(schema))
    except Exception as e:
        return {"error": "cannot convert", e.__class__.__name__: str(e)}

def convert2json(schema: str) -> str:
    try:
        return convert.json_dumps(load_schema(schema))
    except Exception as e:
        return {"error": "cannot convert", e.__class__.__name__: str(e)}

def convert2md(schema: str) -> str:
    try:
        return convert.md_dumps(load_schema(schema))
    except Exception as e:
        return f"# Conversion error\n##{e.__class__.__name__}: {e}"
`;
