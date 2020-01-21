import { combineReducers } from 'redux'
import jadn2json from './jadn'


export default (history) => combineReducers({
  // Custom Reducers
  'jadn2json': jadn2json
})
