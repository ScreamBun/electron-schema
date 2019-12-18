import React, { Fragment } from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader'

// App Component
import App from './src'

// Config
import { createBrowserHistory } from 'history'
import configureStore from './store'

const history = createBrowserHistory()
const store = configureStore(history)

// Import some styles
import 'bootstrap'
import './resources/themes/lumen.css'
import './resources/styles.global.less'

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const baseRef = window.location.pathname.split('/').slice(0, -1).join('/')

// Create main App component
const Root = () => (
  <AppContainer>
    <Provider store={ store } >
      <App history={ history } />
    </Provider>
  </AppContainer>
)

// Render the application into the DOM, the div inside index.html
render(<Root />, document.getElementById('root'))