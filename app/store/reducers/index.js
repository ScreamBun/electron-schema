import { combineReducers } from 'redux';
import convert from './convert';
import tabs from './tabs';

export default () => combineReducers({
  // Custom Reducers
  'convert': convert,
  'tabs': tabs
});
