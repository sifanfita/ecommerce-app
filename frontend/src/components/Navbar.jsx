import React, { useContext, useState, useRef } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

function Navbar() {
  const [visible, setVisible] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileButtonRef = useRef(null)
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
        
        <div className='relative' data-profile-dropdown>
          <button
            type="button"
            ref={profileButtonRef}
            onClick={() => (token ? setProfileOpen((o) => !o) : navigate('/login'))}
            className="p-0 border-0 bg-transparent cursor-pointer"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <img className='w-5' src={assets.profileIcon} alt='Profile' />
          </button>
          {token && profileOpen && (
            <>
              <div
                className='fixed inset-0 z-40'
                aria-hidden
                onClick={() => { setProfileOpen(false); profileButtonRef.current?.focus(); }}
              />
              <div className='absolute right-0 pt-4 z-50'>
                <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-white border shadow-lg text-gray-600 rounded'>
                  <p
                    onClick={() => { setProfileOpen(false); profileButtonRef.current?.focus(); navigate('/orders'); }}
                    className='cursor-pointer hover:text-black'
                  >
                    Orders
                  </p>
                  <p
                    onClick={() => { setProfileOpen(false); profileButtonRef.current?.focus(); logout(); }}
                    className='cursor-pointer hover:text-black'
                  >
                    Logout
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <Link to='/cart' className='relative'>
          <img src={assets.shoppingBag} className='w-5' alt='Cart'/>
          {getCartCount() > 0 && (
            <span className='absolute -right-1 -bottom-1 min-w-4 h-4 text-center leading-4 bg-black text-white rounded-full text-[8px]'>
              {getCartCount()}
            </span>
          )}
        </Link>

        <img onClick={() => setVisible(true)} src={assets.menuIcon} className='w-5 cursor-pointer sm:hidden'/>
      </div>

      {/* Mobile Menu */}
      {visible && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
          aria-hidden
          onClick={() => setVisible(false)}
        />
      )}
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-white shadow-xl transition-transform duration-300 ease-out z-50 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col text-gray-600'>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className='flex items-center gap-4 p-3 text-left hover:bg-gray-50'
          >
            <img className='h-4 rotate-90' src={assets.downArrow} alt="" />
            <p>Back</p>
          </button>
          {['/', '/collection', '/about', '/contact'].map((path, i) => (
            <NavLink key={i} onClick={() => setVisible(false)} className='py-2 pl-6 border hover:bg-gray-50' to={path}>
              {['HOME','COLLECTION','ABOUT','CONTACT'][i]}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Navbar
