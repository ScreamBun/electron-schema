import * as JADNActions from '../actions/jadn'

const initialState = {
  options : {
    type : {
      id : false,
      vtype : '',
      ktype : '',
      enum : '',
      format : '',
      pattern : '', 
      minv : '',
      maxv : '',
      unique : false
    },
    field : {
      minc : '',
      maxc : '',
      tfield : '',
      path : false,
      'default' : 
    }
  }
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
