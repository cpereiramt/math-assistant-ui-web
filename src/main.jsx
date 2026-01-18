import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AppRouter } from './routers/index.jsx';
import { FormulaProvider } from './contexts/FormulaContext.jsx';

import "./index.css";

if (!import.meta.env.VITE_API_BASE_URL ) {
  throw new Error("VITE_API_BASE_URL not defined");
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FormulaProvider>
          <AppRouter>
        <App />
        </AppRouter>
        </FormulaProvider>
    </AuthProvider>
  </StrictMode>,
)
