import React from 'react';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import appReducer, { REDUCER_KEY } from './reducers';
import { getMetadata, setActiveTab } from './actions';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore, routerReducer as routing, routerMiddleware } from 'react-router-redux';
import App from './components/App';
import Match from './components/Match';
import Player from './components/Player';
import Home from './components/Home';
import Search from './components/Search';
import Explorer from './components/Explorer';
import Request from './components/Request';
import Distributions from './components/Distributions';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Promise polyfill for IE
require('es6-promise').polyfill();

// This is used by material-ui components
injectTapEventPlugin();

// Load CSS
// These are sprites, will be needed at some point
// require('./node_modules/dota2-minimap-hero-sprites/assets/stylesheets/dota2minimapheroes.css');
import './assets/flaticon.css';
import './assets/global.css';
const loggerMiddleware = createLogger();

const reducer = combineReducers({
  [REDUCER_KEY]: appReducer,
  routing,
});
const store = createStore(reducer, compose(
  applyMiddleware(thunkMiddleware),
  applyMiddleware(loggerMiddleware),
  applyMiddleware(routerMiddleware(browserHistory)),
  window.devToolsExtension ? window.devToolsExtension() : f => f // This enables the redux dev tools extension, or does nothing if not installed
));

// Fetch metadata (used on all pages)
store.dispatch(getMetadata());
// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);
history.listen(location => store.dispatch(setActiveTab(location.pathname)));
// history.listen(function(location) {Actions.routeChange(location)});
const reactElement = document.getElementById('react');
render(
  <Provider store={store}>
    {/* Tell the Router to use our enhanced history */}
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="search" component={Search} />
        <Route path="matches/:match_id" component={Match}>
          <Route path=":info" />
        </Route>
        <Route path="players/:account_id" component={Player}>
          <Route path=":info">
            <Route path=":subkey" />
          </Route>
        </Route>
        <Route path="explorer" component={Explorer} />
        <Route path="request" component={Request} />
        <Route path="distributions" component={Distributions} />
        <Route path="carry" />
        <Route path="status" />
      </Route>
    </Router>
  </Provider>, reactElement);
