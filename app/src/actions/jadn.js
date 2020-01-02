import { ipcRenderer } from 'electron'

export const CONVERT_TO_JSON_SUCCESS = 'CONVERT_TO_JSON_SUCCESS';

export const convertToJSON = (schema) => {
  return (dispatch) => {
    ipcRenderer.invoke('render-python', {schema})
    .then(res => {
      dispatch(convertToJSONSuccess(res))
    });
  }

};

const convertToJSONSuccess = json_schema => ({
  type: CONVERT_TO_JSON_SUCCESS,
  payload: json_schema
});

