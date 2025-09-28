import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes } from "@generouted/react-router";
import { AuthProvider } from './contexts/AuthContext';
import './App.css'
// import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Routes />
    </AuthProvider>
  </StrictMode>,
)
