import React from 'react'
import Title from '../Title'
import { assets } from '../../assets/assets'


function About() {
  return (              
    <div>
      <div className='text-2xl text-center pt-8'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.aboutImage} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>At Dinko, we believe clothes should do more than just cover you — they should reflect who you are.
We started with one goal: to build a brand that delivers premium quality, sharp design, and real value — without the nonsense.
We’re not here to follow trends. We’re here to set the standard. Every piece is carefully selected, from the fabric to the fit, so you look good, feel great, and stay comfortable all day long.
</p>
        <b className='text-gray-800'>Our Mission</b>
        <p>To make every man feel confident, sharp, and unstoppable — one wardrobe upgrade at a time.
We’re committed to delivering timeless style, unbeatable quality, and hassle-free shopping, so you can focus on what matters most: living your life on your terms.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>


      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>We don’t cut corners. Every piece is crafted with premium fabrics and meticulous attention to detail — built to last, not just to look good today.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Shop on your time. Fast shipping, easy returns, and a seamless experience from cart to doorstep. No stress, just style.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>We’re here for you 24/7. Real people, real help — whether it’s sizing advice or tracking your order. You’re never just another customer.</p>
        </div>

      </div>
      
      
    </div> 
  )        
}    

export default About  



