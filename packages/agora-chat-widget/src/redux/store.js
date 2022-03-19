import { createStore } from 'redux';
import reducer from './reducers';

export const ref = {
  store: null,
};

const _ = () =>
  (ref.store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  ));

export default _;
