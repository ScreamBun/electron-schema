import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';

// Config
import configureStore from './store';

// Import styles
import './resources/styles.global.less';

// App Components
import App from './src';

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

// Create main App component
const Root = () => (
  <AppContainer>
    <Provider store={ store } >
      <App />
    </Provider>
  </AppContainer>
);

// Render the application into the DOM, the div inside index.html
render(<Root />, document.getElementById('root'));
