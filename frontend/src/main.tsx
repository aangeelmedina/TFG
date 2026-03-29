import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { CentrosProvider } from './context/CentrosContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CentrosProvider>
          <App />
        </CentrosProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
