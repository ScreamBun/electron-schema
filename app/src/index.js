import React, { Fragment } from 'react'
import GenerateSchema from './generate'

import {
  Nav,
  Sidebar
} from './static'

const App = ({ history }) => (
  <Sidebar>
    <div id='contents' className='container-fluid mt-3' >
      <Nav history={ history } />
      <GenerateSchema />
      <pre></pre>
    </div>
  </Sidebar>
)

export default App