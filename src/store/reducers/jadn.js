import * as ConvertActions from '../actions/convert';
import * as JADNActions from '../actions/jadn';
import { objectFromTuple } from '../../src/utils';

const initialState = {
  baseTypes: ['Binary', 'Boolean', 'Integer', 'Number', 'Null', 'String', 'Enumerated', 'Choice', 'Array', 'ArrayOf', 'Map', 'MapOf', 'Record'],
  schemaTypes: {}
};

const schemaConversions = Object.keys(ConvertActions).filter(fun => fun.startsWith('convertTo'));

export default (state = initialState, action = null) => {
  const schema = action.payload || {};

  switch (action.type) {
    case JADNActions.SET_BASE_JADN_SUCCESS:
      setTimeout(() => {
        action.asyncDispatch(ConvertActions.setJADN(schema));
        schemaConversions.forEach(fmt => {
          action.asyncDispatch(ConvertActions[fmt](schema));
        });
      }, 250);

      return {
        ...state,
        schemaTypes: objectFromTuple(
          ...(schema.types || []).map(t => [t[0], t[1]] )
        )
      };

    case JADNActions.SET_BASE_JADN_FAILURE:
      console.error(schema);
      return state;

    default:
      return state;
  }
};
