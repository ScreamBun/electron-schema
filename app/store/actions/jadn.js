import { ipcRenderer } from 'electron';
import { SchemaFormats } from 'jadnschema';

const emit = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

// Store functions
export const SET_BASE_JADN_SUCCESS= '@@jadn/SET_BASE_JADN_SUCCESS';
export const setJADN = schema => {
  return dispatch => emit('convert-schema', {
    format: SchemaFormats.JADN,
    schema
  })
  // eslint-disable-next-line promise/always-return
  .then(jadnSchema => {
    dispatch({
      type: SET_BASE_JADN_SUCCESS,
      payload: JSON.parse(jadnSchema)
    });
  });
};