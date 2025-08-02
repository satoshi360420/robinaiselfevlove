import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { TaskProvider } from './contexts/TaskContext';
import { CommandPaletteProvider } from './contexts/CommandPaletteContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <CommandPaletteProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </CommandPaletteProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);