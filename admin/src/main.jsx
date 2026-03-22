import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import AdminContext from './context/AdminContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthContext>
        <AdminContext>
          <ModalProvider>
            <App />
          </ModalProvider>
        </AdminContext>
      </AuthContext>
    </ThemeProvider>
  </BrowserRouter>
)
