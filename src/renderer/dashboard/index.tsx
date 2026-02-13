/**
 * Dashboard renderer entry point
 * Main application window for managing miniGamba
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/main.css';

// TODO: Set up Redux/Zustand store
// import { Provider } from 'react-redux';
// import store from './state/store';

console.log('miniGamba Dashboard initializing...');

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    {/* TODO: Wrap with state provider when implemented */}
    {/* <Provider store={store}> */}
      <App />
    {/* </Provider> */}
  </React.StrictMode>
);

// TODO: Set up IPC communication
// const api = (window as any).electronAPI;

console.log('miniGamba Dashboard ready');
