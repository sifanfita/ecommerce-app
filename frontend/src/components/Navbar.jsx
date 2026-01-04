import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

function Navbar() {
  const [visible, setVisible] = useState(false)
  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext)

  const logout = () => {
    sessionStorage.removeItem('token')
    setToken('')
    setCartItems({})
    navigate('/login')
  }

  return (
    <div className='fixed top-0 left-0 w-full bg-white z-50 shadow-sm flex justify-between items-center py-5 font-medium px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>

      <Link to='/'><img src={assets.Logo} alt="logo" className='w-20 h-20' /></Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        {['/', '/collection', '/about', '/contact'].map((path, i) => (
          <NavLink key={i} to={path} className='flex flex-col items-center gap-1'>
            <p>{['HOME','COLLECTION','ABOUT','CONTACT'][i]}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
          </NavLink>
        ))}
      </ul>

      <div className='flex items-center gap-6'>
        <img onClick={()=>setShowSearch(true)} src={assets.searchIcon} className='w-5 cursor-pointer'/>
        
        <div className='group relative'>
          <img onClick={() => {token ? null : navigate('/login')}} className='w-5 cursor-pointer' src={assets.profileIcon}/>
          {token && (
            <div className='group-hover:block hidden absolute right-0 pt-4'>
              <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black'>Orders</p>
                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
              </div>
            </div>
          )}
        </div>

        <Link to='/cart' className='relative'>
          <img src={assets.shoppingBag} className='w-5'/>
          <p className='absolute -right-1 -bottom-1 w-4 text-center leading-4 bg-black text-white rounded-full text-[8px]'>{getCartCount()}</p>
        </Link>

        <img onClick={() => setVisible(true)} src={assets.menuIcon} className='w-5 cursor-pointer sm:hidden'/>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 bottom-0 bg-white transition-all ${visible ? 'w-full' : 'w-0'} overflow-hidden z-40`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
            <img className='h-4 rotate-90' src={assets.downArrow}/>
            <p>Back</p>
          </div>
          {['/', '/collection', '/about', '/contact'].map((path, i) => (
            <NavLink key={i} onClick={() => setVisible(false)} className='py-2 pl-6 border' to={path}>
              {['HOME','COLLECTION','ABOUT','CONTACT'][i]}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Navbar
