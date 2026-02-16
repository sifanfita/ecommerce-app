import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className="w-full bg-gray-900 text-gray-200 mx-0"> {/* full width */}

      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 px-6 sm:px-20 text-sm pt-10'>
        <div>
          <Link to='/'><img src={assets.Logo} className='mb-4 w-20 h-20' alt='Logo'/></Link>
          <p className='w-full md:w-2/3 mb-1'>Dinko Men’s Online Shop</p>
          <p className='w-full md:w-2/3 mb-1 text-gray-400'>Premium style for the modern man.</p>
          <p className='w-full md:w-2/3 text-gray-400'>Quality. Confidence. No compromise.</p>
        </div>

        <div className='pt-10 sm:pt-0'>
          <p className='text-xl font-medium mb-4'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-400'>
            <li><Link to='/' className='hover:text-gray-200'>Home</Link></li>
            <li><Link to='/about' className='hover:text-gray-200'>About us</Link></li>
            <li><Link to='/contact' className='hover:text-gray-200'>Contact</Link></li>
          </ul>
        </div>

        <div className='pt-10 sm:pt-0'>
          <p className='text-xl font-medium mb-4'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-400'>
            <li><a href='tel:+251922249789' className='hover:text-gray-200'>+251922249789</a></li>
            <li><a href='mailto:dinko@gmail.com' className='hover:text-gray-200'>dinko@gmail.com</a></li>
          </ul>
        </div>
      </div>

      <div className='border-t border-gray-700'>
        <p className='py-5 text-sm text-center text-gray-400'>
          Copyright 2025 © Dinko Online Shop - All Rights Reserved.
        </p>
      </div>

    </div>
  )
}

export default Footer
