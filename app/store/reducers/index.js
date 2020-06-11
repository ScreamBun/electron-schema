import { combineReducers } from 'redux';
import convert from './convert';
import tabs from './tabs';

export default history => combineReducers({  // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  // Custom Reducers
  'convert': convert,
  'tabs': tabs
});
