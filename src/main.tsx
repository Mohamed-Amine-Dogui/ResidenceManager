// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🔥 main.tsx executing - This should only appear on initial page load!');

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

createRoot(document.getElementById('root')!).render(
  // Temporarily disabled StrictMode to prevent double renders during development
  // <StrictMode>
    <App />
  // </StrictMode>,
)
