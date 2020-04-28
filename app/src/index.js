import React from 'react';
import PropTypes from 'prop-types';
import { createBrowserHistory } from 'history';
import GenerateSchema from './generate';
import { Nav, Sidebar } from './static';

const App = ({ history }) => (
  <Sidebar>
    <div id="contents" className="container-fluid mt-3">
      <Nav history={ history } />
      <GenerateSchema />
    </div>
  </Sidebar>
);

App.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired
};

export default App;
