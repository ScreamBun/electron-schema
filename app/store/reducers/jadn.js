import * as JADNActions from '../../src/actions/jadn'

const initialState = {
  json_schema : {}
}

export default (state = initialState, action=null) => {
  switch (action.type) {
    case JADNActions.CONVERT_TO_JSON_SUCCESS:
      return {
        ...state,
        json_schema: action.payload
      };
    default:
      return state;
  }
}
