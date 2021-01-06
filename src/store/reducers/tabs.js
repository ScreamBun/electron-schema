import * as TabActions from '../actions/tabs';

const initialState = {
  activeView: 'editor',
  tabs: []
};

export default (state = initialState, action = null) => {
  switch (action.type) {
    case TabActions.SET_TABS_SUCCESS:
      return {
        ...state,
        tabs: action.payload
      };

    case TabActions.SET_ACTIVE_TAB_SUCCESS:
      return {
        ...state,
        activeView: action.payload
      };

    default:
      return state;
  }
};
