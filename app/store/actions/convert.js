import { ipcRenderer } from 'electron';
import { SchemaFormats } from 'jadnschema';

// Store functions
export const CONVERT_TO_JSON_SUCCESS = '@@convert/CONVERT_TO_JSON_SUCCESS';
export const convertToJSON = schema => {
  return dispatch => ipcRenderer
    .invoke('convert-schema', {
      format: SchemaFormats.JSON,
      schema
    })
    // eslint-disable-next-line promise/always-return
    .then(jsonSchema => {
      dispatch({
        type: CONVERT_TO_JSON_SUCCESS,
        payload: JSON.parse(jsonSchema)
      });
    });
};


export const CONVERT_TO_MARKDOWN_SUCCESS = '@@convert/CONVERT_TO_MARKDOWN_SUCCESS';
export const convertToMD = schema => {
  return dispatch => ipcRenderer
    .invoke('convert-schema', {
      format: SchemaFormats.MarkDown,
      schema
    })
    // eslint-disable-next-line promise/always-return
    .then(mdSchema => {
      dispatch({
        type: CONVERT_TO_MARKDOWN_SUCCESS,
        payload: mdSchema
      });
    });
};
