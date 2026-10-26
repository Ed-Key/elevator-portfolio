// Entry for /cua, the cua-driver case study. It is a separate page from the
// elevator so a visitor who lands here does not download three.js.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/newsreader/standard.css'
import '@fontsource-variable/newsreader/standard-italic.css'
import '@fontsource-variable/geist-mono/wght.css'
import CuaCaseStudy from './components/CuaCaseStudy.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CuaCaseStudy />
  </StrictMode>,
)
