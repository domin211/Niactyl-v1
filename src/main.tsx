import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
