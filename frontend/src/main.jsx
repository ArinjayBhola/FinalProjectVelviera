import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/authContext.jsx'
import UserContext from './context/UserContext.jsx'
import ShopContextProvider from './context/ShopContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthContext>
        <UserContext>
          <ModalProvider>
            <ShopContextProvider>
              <App />
            </ShopContextProvider>
          </ModalProvider>
        </UserContext>
      </AuthContext>
    </ThemeProvider>
  </BrowserRouter>
)
