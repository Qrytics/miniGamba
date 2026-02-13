/**
 * Overlay renderer entry point
 * Always-on-top window for playing mini-games
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import OverlayApp from './components/OverlayApp';
import './styles/main.css';

console.log('miniGamba Overlay initializing...');

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <OverlayApp />
  </React.StrictMode>
);

// TODO: Set up IPC communication
// const api = (window as any).electronAPI;

// TODO: Make window draggable
// TODO: Set up hotkey listeners

console.log('miniGamba Overlay ready');
