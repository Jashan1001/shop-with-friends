import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1 minute
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0A0A0A',
            border: '2.5px solid #0A0A0A',
            boxShadow: '3px 3px 0 #0A0A0A',
            borderRadius: '0px',
            fontFamily: 'General Sans, sans-serif',
            fontSize: '13px',
            fontWeight: '600',
          },
          success: {
            style: {
              background: '#C6FF00',
              color: '#0A0A0A',
            },
            iconTheme: { primary: '#0A0A0A', secondary: '#C6FF00' },
          },
          error: {
            style: {
              background: '#FF5252',
              color: '#FFFFFF',
              border: '2.5px solid #0A0A0A',
            },
            iconTheme: { primary: '#FFFFFF', secondary: '#FF5252' },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)