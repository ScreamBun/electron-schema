import * as ConvertActions from '../actions/convert';

const initialState = {
  json_schema: {},
  md_schema: ''
};

export default (state = initialState, action = null) => {
  switch (action.type) {
    case ConvertActions.CONVERT_TO_JSON_SUCCESS:
      return {
        ...state,
        json_schema: action.payload
      };

    case ConvertActions.CONVERT_TO_MARKDOWN_SUCCESS:
      return {
        ...state,
        md_schema: action.payload
      };

    default:
      return state;
  }
};
