import { ipcRenderer } from 'electron';
import { SchemaFormats } from '../../src/utils';

export const CONVERT_TO_JSON_SUCCESS = 'CONVERT_TO_JSON_SUCCESS';
export const convertToJSON = schema => {
  return dispatch => {
    ipcRenderer
      .invoke('convert-schema', {
        format: SchemaFormats.JSON,
        schema
      })
      .then(res => {
        // eslint-disable-next-line no-unused-vars
        dispatch(convertToJSONSuccess(res));
      });
  };
};

const convertToJSONSuccess = jsonSchema => ({
  type: CONVERT_TO_JSON_SUCCESS,
  payload: jsonSchema
});
