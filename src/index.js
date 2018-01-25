import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import CalculatorContainer from './CalculatorContainer';
import registerServiceWorker from './registerServiceWorker';
import FormDemo1 from './FormDemo1';
import Example0010 from './Example0010';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducer';

const store = createStore(reducer);

ReactDOM.render(
  // <App />,
  // <Provider store={store}>
  //   <CalculatorContainer />
  // </Provider>,
  // <FormDemo1 />
  <div>
    <Example0010 foo="1" />
  </div>
    ,
  document.getElementById('root')
);
registerServiceWorker();
