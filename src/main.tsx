import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import './index.css'
import Router from './Router.tsx'

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <Router pathname={window.location.pathname} />
  </StrictMode>
)
