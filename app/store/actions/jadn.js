import { ipcRenderer } from 'electron';
import { SchemaFormats } from 'jadnschema';

// Helper functions
export const CONVERT_TO_JSON_SUCCESS = 'CONVERT_TO_JSON_SUCCESS';
const convertToJSONSuccess = jsonSchema => ({
  type: CONVERT_TO_JSON_SUCCESS,
  payload: JSON.parse(jsonSchema)
});

// Store functions
export const convertToJSON = schema => {
  return dispatch => ipcRenderer
    .invoke('convert-schema', {
      format: SchemaFormats.JSON,
      schema
    })
    // eslint-disable-next-line promise/always-return
    .then(res => {
      dispatch(convertToJSONSuccess(res));
    });
};
