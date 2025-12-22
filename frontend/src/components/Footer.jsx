import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-small'>
            <div>
                <img src={assets.Logo} className='mb-0 w-32' alt=''/>
                <p className='w-full md:w-2/3 text-gray-700'>Dinko Men’s Online Shop</p>
                <p className='w-full md:w-2/3 text-gray-600'>Premium style for the modern man.</p>
                <p className='w-full md:w-2/3 text-gray-600'>Quality. Confidence. No compromise.</p>
            </div>
            <div className='pt-10'>
                <p className='text-xl font-medium mb-10'>COMPANY</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy policy</li>
                </ul>
            </div>
            <div className='pt-10'>
                <p className='text-xl font-medium mb-10'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>+251922249789</li>
                    <li>dinko@gmail.com</li>
                </ul>
            </div>

        </div>
        <div>
            <hr/>
            <p className='py-5 text-sm text-center'>Copyright 2025 © Dinko Online Shop - All Rights Reserved.</p>
        </div>
    </div>
  )
}

export default Footer