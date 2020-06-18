import React, { Component } from 'react';
import GenerateSchema from './generate';
import { Nav, Sidebar } from './static';


const App = (): Component => (
  <Sidebar>
    <div id="contents" className="container-fluid mt-3">
      <Nav />
      <GenerateSchema />
    </div>
  </Sidebar>
);

export default App;
