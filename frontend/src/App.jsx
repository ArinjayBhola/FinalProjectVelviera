import React, { useCallback, useContext } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Registration from './pages/Registration'
import Home from './pages/Home'
import Login from './pages/Login'
import MainLayout from './components/layout/MainLayout'
import ScrollToTop from './components/layout/ScrollToTop'
import { userDataContext } from './context/UserContext'
import About from './pages/About'
import Collections from './pages/Collections'
import Product from './pages/Product'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Order from './pages/Order'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'
import Ai from './component/Ai'
import VisualSearch from './pages/VisualSearch'
function App() {
let {userData} = useContext(userDataContext)
let location = useLocation()
  
  return (
    <MainLayout>
      <ScrollToTop />
      <Routes>

        <Route path='/login' 
        element={userData ? (<Navigate to={location.state?.from || "/"}/> ) 
        : (<Login/>)
          }/>

        <Route path='/signup' 
        element={userData ? (<Navigate to={location.state?.from || "/"}/> ) 
        : (<Registration/>)}/>

        <Route path='/' 
        element={userData ? <Home/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
      
        <Route path='/about' 
        element={userData ? <About/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/collection' 
        element={userData ? <Collections/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/wishlist' 
        element={userData ? <Wishlist/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/product' 
        element={userData ? <Product/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/contact' 
        element={userData ? <Contact/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
        <Route path='/productdetail/:productId' 
        element={userData ? <ProductDetail/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='/cart' 
        element={userData ? <Cart/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

          <Route path='/placeorder' 
        element={userData ? <PlaceOrder/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>
         <Route path='/order'
        element={userData ? <Order/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

         <Route path='/visual-search'
        element={userData ? <VisualSearch/> : <Navigate to="/login" state={{from: location.pathname}} /> }/>

        <Route path='*' element={<NotFound/>}/>
      </Routes>
      {!['/login', '/signup'].includes(location.pathname) && <Ai/>}
    </MainLayout>
  )
}

export default App
