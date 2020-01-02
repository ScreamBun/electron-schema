import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import jadn2json from './jadn'


export default (history) => combineReducers({
  'router': connectRouter(history), // MUST BE 'router'
  // Custom Reducers
  'jadn2json': jadn2json
})
