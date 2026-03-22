import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Add from './pages/Add'
import Lists from './pages/Lists'
import Orders from './pages/Orders'
import Login from './pages/Login'
import AddCategory from './pages/AddCategory'
import SidebarLayout from './components/layout/SidebarLayout'
import { adminDataContext } from './context/AdminContext'

function App() {
  let {adminData} = useContext(adminDataContext)
  return (

    <>
    {!adminData ? <Login/> : (
      <SidebarLayout>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/add' element={<Add/>}/>
          <Route path='/add-category' element={<AddCategory/>}/>
          <Route path='/lists' element={<Lists/>}/>
          <Route path='/orders' element={<Orders/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      </SidebarLayout>
    )}
    </>
  )
}

export default App
