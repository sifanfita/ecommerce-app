import React from 'react'
import Title from '../Title'
import { assets } from '../../assets/assets'


function Contact() {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.ContactImage} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className='text-gray-500'> Infront of Hiwot Building, Plaza Market Center <br /> Bishoftu, Oromia, Ethiopia</p>
          <p className='text-gray-500'>Tel: 0922249789 <br /> Email: dinko@gmail.com <br /> Telegram: @DiNkogeb</p>
          <p className='text-gray-500'>Business Hours: Mon - Sat: 9:00 AM - 6:00 PM</p>
          
        </div>
      </div>
      
    </div>
  )
}

export default Contact