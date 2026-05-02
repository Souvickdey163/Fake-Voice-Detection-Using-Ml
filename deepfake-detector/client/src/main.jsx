import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

if (!googleClientId) {
  console.error('Missing VITE_GOOGLE_CLIENT_ID. Google login is disabled.')
}

createRoot(document.getElementById('root')).render(
  <App />
)
