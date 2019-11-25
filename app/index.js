import React, { Fragment } from 'react'
import { render } from 'react-dom'
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader'

// Import some styles
// import './styles/App.css'

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

// Create main App component
const Root = () => (
  <AppContainer>
    <h1>Hello, this is your first Electron app!</h1>
    <p>I hope you enjoy using this electron react app.</p>
  </AppContainer>
)

// Render the application into the DOM, the div inside index.html
render(<Root />, document.getElementById('root'))