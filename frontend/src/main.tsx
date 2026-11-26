import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { acordarApi } from './api/cliente'
import './index.css'

acordarApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
