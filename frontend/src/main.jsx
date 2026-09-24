import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { HotelSettingsProvider } from './context/HotelSettingsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HotelSettingsProvider>
      <App />
    </HotelSettingsProvider>
  </React.StrictMode>,
)