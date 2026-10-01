import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/pinyon-script/latin-400.css'
import '@fontsource/pinyon-script/latin-ext-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/instrument-serif/latin-ext-400-italic.css'
import '@fontsource-variable/instrument-sans/standard.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
