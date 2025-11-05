import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminAuthProvider } from './Components/Context/AdminContext.tsx'
import { OfficerAuthProvider } from './Components/Context/OfficerContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      <OfficerAuthProvider>
    <App />
    </OfficerAuthProvider>
    </AdminAuthProvider>
  </StrictMode>,
)
