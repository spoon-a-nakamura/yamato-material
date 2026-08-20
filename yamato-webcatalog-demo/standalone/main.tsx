import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { HashNavProvider } from '@/app/nav'
import { App } from '@/app/app'
import '@/styles/globals.css'

const el = document.getElementById('root')
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <HashNavProvider>
        <App />
      </HashNavProvider>
    </React.StrictMode>
  )
}
