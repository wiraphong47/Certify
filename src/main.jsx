import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CertifyProvider } from './context/CertifyContext.jsx'
import { ThemeModeProvider } from './context/ThemeModeContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <CertifyProvider>
          <App />
        </CertifyProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
