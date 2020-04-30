import { combineReducers } from 'redux';
import jadn2json from './jadn';

export default history => combineReducers({  // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  // Custom Reducers
  'jadn2json': jadn2json
});
