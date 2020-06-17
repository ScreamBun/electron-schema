import React from 'react';
import GenerateSchema from './generate';
import { Nav, Sidebar } from './static';

const App = () => (
  <Sidebar>
    <div id="contents" className="container-fluid mt-3">
      <Nav />
      <GenerateSchema />
    </div>
  </Sidebar>
);

export default App;
