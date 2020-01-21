import { ipcRenderer } from 'electron'
import { SchemaFormats } from '../../src/utils'


export const CONVERT_TO_JSON_SUCCESS = 'CONVERT_TO_JSON_SUCCESS';
export const convertToJSON = (schema) => {
  return (dispatch) => {
    console.log('hello this works')
    ipcRenderer.invoke('convert-schema', {
      format: SchemaFormats.JSON,
      schema: schema
    }).then(res => {
      dispatch(convertToJSONSuccess(res))
    });
  }
};

const convertToJSONSuccess = json_schema => ({
  type: CONVERT_TO_JSON_SUCCESS,
  payload: json_schema
});

