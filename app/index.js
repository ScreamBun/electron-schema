import React, { Fragment } from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router'
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader'

// Custom Components
import {
  Error,
  GenerateSchema,
  Home,
  Nav,
  Sidebar
} from './src'

// Config
import { createBrowserHistory } from 'history'
import configureStore from './store'

const history = createBrowserHistory()
const store = configureStore(history)

// Import some styles
// import 'bootstrap'
import './resources/themes/lumen.css'
import './resources/styles.global.less'

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const baseRef = window.location.pathname.split('/').slice(0, -1).join('/')

// Create main App component
const Root = () => (
  <AppContainer>
    <Provider store={ store } >
      {/* <Sidebar> */}
        <div id='contents' className='container-fluid mt-3' >
          <Nav history={ history } />
          <ConnectedRouter history={ history }>
            <Switch>
              {/* <Route exact path={ baseRef + '/app.html' } component={ Home } /> */}
              <Route exact path={ baseRef + '/app.html' } component={ GenerateSchema } />
              <Route component={ Error } /> // This should always be last route
            </Switch>
          </ConnectedRouter>
        </div>
      {/* </Sidebar> */}
    </Provider>
  </AppContainer>
)

// Render the application into the DOM, the div inside index.html
render(<Root />, document.getElementById('root'))