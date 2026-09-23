import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import Router from './Router'

export function render(pathname = '/') {
  return renderToString(
    <StrictMode>
      <Router pathname={pathname} />
    </StrictMode>
  )
}
