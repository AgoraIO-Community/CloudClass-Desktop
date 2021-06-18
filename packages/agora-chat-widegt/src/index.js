import React from 'react';
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom';
import store from './redux/store'
import App from './App';
import { BrowserRouter } from 'react-router-dom'

import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
  ,
  document.getElementById('root')
);