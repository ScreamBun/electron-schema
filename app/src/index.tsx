import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import GenerateSchema from './generate';
import { Nav, Sidebar } from './static';
import configureStore from '../store';

type Props = {
  store: ReturnType<typeof configureStore>;
  // history: History;
}


const App = ({ store }: Props) => (
  <Provider store={ store } >
    <Sidebar>
      <div id="contents" className="container-fluid mt-3">
        <Nav />
        <GenerateSchema />
      </div>
    </Sidebar>
  </Provider>
);

export default hot(App);
