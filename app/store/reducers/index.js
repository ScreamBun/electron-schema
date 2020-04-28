import { combineReducers } from 'redux';
import jadn2json from './jadn';

// eslint-disable-next-line no-unused-vars
export default history => combineReducers({
  // Custom Reducers
  'jadn2json': jadn2json
});
