import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { AppProviders } from './providers/AppProviders'
import '../css/app.css'

const container = document.getElementById('app')

document.documentElement.classList.remove('dark')
document.documentElement.style.colorScheme = 'light'

if (!container) {
  throw new Error('MoriHome could not find its mount element.')
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
