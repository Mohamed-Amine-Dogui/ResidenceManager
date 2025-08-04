// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🔥 main.tsx executing - This should only appear on initial page load!');

// CRITICAL: Opt-in to Vite HMR to prevent full page refreshes
// This is a common cause of form submission page refresh issues in Vite
if (import.meta.hot) {
  import.meta.hot.accept();
  console.log('🔥 HMR enabled - Vite should use hot reloading instead of full refresh');
}

// Global error handlers to catch what's causing page reload
window.addEventListener('error', (event) => {
  console.error('🚨 GLOBAL ERROR:', event.error);
  console.error('🚨 Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION:', event.reason);
});

// Monitor navigation changes that might be causing the refresh
let navigationCount = 0;
window.addEventListener('popstate', (event) => {
  navigationCount++;
  console.log('🚨 NAVIGATION EVENT #' + navigationCount + ':', {
    event: 'popstate',
    state: event.state,
    url: window.location.href
  });
});

// Monitor for any form submissions at the document level
document.addEventListener('submit', (event) => {
  console.log('🚨 DOCUMENT LEVEL FORM SUBMIT DETECTED:', {
    target: event.target,
    prevented: event.defaultPrevented,
    currentTarget: event.currentTarget
  });
  
  if (!event.defaultPrevented) {
    console.error('🚨 FORM SUBMIT NOT PREVENTED! This will cause page refresh!');
  }
});

createRoot(document.getElementById('root')!).render(
  // Temporarily disabled StrictMode to prevent double renders during development
  // <StrictMode>
    <App />
  // </StrictMode>,
)
