import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';

// App Components
import { configuredStore } from './store';
import App from './src';

// App Styles
import './resources/styles.less';

// App Config
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const store = configuredStore();

// Create main App component
const Root = () => (
  <AppContainer>
    <App store={ store } />
  </AppContainer>
);

// Render the application into the DOM, the #root div inside index.html
document.addEventListener('DOMContentLoaded', () => {
  render(<Root />, document.getElementById('root'));
});
