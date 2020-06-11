
// Store functions
export const SET_TABS_SUCCESS = '@@tabs/SET_TABS_SUCCESS';
export const setTabs = tabs => {
  return dispatch => {
    dispatch({
      type: SET_TABS_SUCCESS,
      payload: tabs
    });
  };
};


export const SET_ACTIVE_TAB_SUCCESS = '@@tabs/SET_ACTIVE_TAB_SUCCESS';
export const setActiveTab = tab => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_TAB_SUCCESS,
      payload: tab.toLowerCase()
    });
  };
};
