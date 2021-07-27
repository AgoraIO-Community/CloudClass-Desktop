import { createStore } from 'redux';
import reducer from './reducers';

const store = createStore(reducer);
window.store = store;

export default store;
