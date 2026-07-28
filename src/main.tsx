import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { syncFromServer } from './mockData';

const init = async () => {
  try {
    await syncFromServer();
  } catch(e) {}
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary><App /></ErrorBoundary>
    </StrictMode>,
  );
};

init();
