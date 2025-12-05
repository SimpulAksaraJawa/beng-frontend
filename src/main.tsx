// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes } from "@generouted/react-router";
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { Toaster } from './components/ui/sonner';
import BreakpointIndicator from "./components/breakpoint-indicator";

// import App from './App.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster position='top-center' richColors closeButton theme='light'/>
        <BreakpointIndicator />
        <Routes />
      </QueryClientProvider>
    </AuthProvider>
  // </StrictMode>,
)
