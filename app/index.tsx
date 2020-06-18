import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';

// App Components
import configureStore from './store';
import App from './src';

// App Styles
import './resources/styles.global.less';

// App Config
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const store = configureStore();

// Create main App component
const Root = (): Component => (
  <AppContainer>
    <Provider store={ store } >
      <App />
    </Provider>
  </AppContainer>
);

// Render the application into the DOM, the #root div inside index.html
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => render(<Root />, document.getElementById('root')), 10);
});
