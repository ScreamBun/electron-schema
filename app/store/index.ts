import storage from 'redux-persist/es/storage';
import { apiMiddleware } from 'redux-api-middleware';
import { createStore, compose, applyMiddleware } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

import createRootReducer from './reducers';
import asyncDispatchMiddleware from './asyncDispatchMiddleware';

// Base State
const rootReducer = createRootReducer();
export type RootState = ReturnType<typeof rootReducer>;

export const configuredStore = (initialState?: RootState) => {
  const reducer = persistReducer(
    {
      key: 'schema_gui',
      storage,
      whitelist: [],
      blacklist: ['Router'],
      transforms: []
    },
    rootReducer
  );

  const middleware = [
    apiMiddleware,
    thunk,
    asyncDispatchMiddleware
  ];

  // Logger
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      diff: false,
      level: 'info',
      logErrors: true
    });
    middleware.push(logger);
  }

  const enhancers = compose(
    applyMiddleware(
      ...middleware
    )
  );

  const store = createStore(
    reducer,
    initialState,
    enhancers
  );

  persistStore(store);
  return store;
};

export type Store = ReturnType<typeof configuredStore>;