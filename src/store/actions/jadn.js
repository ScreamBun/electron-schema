import { ipcRenderer } from 'electron';
import { SchemaFormats } from 'jadnschema';

const emit = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

// Store functions
export const SET_BASE_JADN_SUCCESS = '@@jadn/SET_BASE_JADN_SUCCESS';
export const SET_BASE_JADN_FAILURE = '@@jadn/SET_BASE_JADN_FAILURE';
export const setJADN = schema => {
  return dispatch => emit('convert-schema', {
    format: SchemaFormats.JADN,
    schema
  })
  .then(rslt => {
    const payload = JSON.parse(rslt);
    const keys = Object.keys(payload);
    dispatch({
      // eslint-disable-next-line promise/always-return
      type: (keys.includes('info') && keys.includes('types')) ? SET_BASE_JADN_SUCCESS : SET_BASE_JADN_FAILURE,
      payload
    });
  });
};
