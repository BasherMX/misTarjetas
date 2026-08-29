import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log(
  `%c──────────▄\n────────▄██\n─▄▀██▀█▀█▀███▀\n▀▀▀▀▀████▀▀▀\n──────▀██`,
  'color: #2563eb; font-weight: bold; font-size: 14px;'
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
