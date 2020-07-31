import { combineReducers } from 'redux';
import convert from './convert';
import jadn from './jadn';
import tabs from './tabs';

export default () => combineReducers({
  // Custom Reducers
  'convert': convert,
  'jadn': jadn,
  'tabs': tabs
});
