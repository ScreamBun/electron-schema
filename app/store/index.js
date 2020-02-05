import storage from 'redux-persist/es/storage';
import { apiMiddleware } from 'redux-api-middleware';
import { createStore, compose, applyMiddleware } from 'redux';
import { createFilter } from 'redux-persist-transform-filter';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

import createRootReducer from './reducers';
import asyncDispatchMiddleware from './asyncDispatchMiddleware';

export default history => {
  const persistedFilter = createFilter('Auth', ['access']);

  const reducer = persistReducer(
    {
      key: 'orc_gui',
      storage,
      whitelist: ['Auth'],
      blacklist: ['Router'],
      transforms: [persistedFilter]
    },
    createRootReducer(history)
  );

  const middleware = [apiMiddleware, thunk, asyncDispatchMiddleware];

  // Logger
  if (process.env.NODE_ENV === 'development') {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      diff: false,
      level: 'info',
      logErrors: true
    });
    middleware.push(logger);
  }

  const enhancers = compose(applyMiddleware(...middleware));

  const store = createStore(reducer, {}, enhancers);

  persistStore(store);
  return store;
};
