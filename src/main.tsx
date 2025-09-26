import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes } from "@generouted/react-router";
import './App.css'
// import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Routes />
  </StrictMode>,
)
