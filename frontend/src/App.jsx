import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/pages/Home'
import Collection from './components/pages/Collection'
import Navbar from './components/Navbar'
import About from './components/pages/About'
import Contact from './components/pages/Contact'
import Product from './components/pages/Product'
import Login from './components/pages/Login'
import Orders from './components/pages/Orders'
import PlaceOrder from './components/pages/PlaceOrder'
import Cart from './components/pages/Cart'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
function App() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <Navbar /> 
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/login' element={<Login />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/cart' element={<Cart />} />


      </Routes>
      <Footer/>

    </div>
  )
}

export default App