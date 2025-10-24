import React from 'react'
import Title from '../Title'
import { assets } from '../../assets/assets'


function About() {
  return (              
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.aboutImage} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam vitae ducimus corporis at autem quibusdam reprehenderit, error iste atque officia perferendis, fugiat vel, eius quisquam ullam omnis eligendi doloremque dolor?</p>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vel temporibus, eaque animi sequi consequatur iste autem odio cumque corrupti ipsum molestias nulla distinctio, possimus rem impedit unde numquam quaerat cum?</p>
        <b className='text-gray-800'>Our Mission</b>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt reiciendis facilis, fuga saepe beatae sapiente. Incidunt, aspernatur dolores, reprehenderit aliquam ratione hic, nesciunt doloribus quia voluptatem eligendi suscipit consequatur laudantium?</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>


      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. A quis facere maxime magni. Harum numquam et odit ipsum expedita dolorum atque nemo molestiae sit? Ad optio ipsam animi suscipit iste!</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. A quis facere maxime magni. Harum numquam et odit ipsum expedita dolorum atque nemo molestiae sit? Ad optio ipsam animi suscipit iste!</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. A quis facere maxime magni. Harum numquam et odit ipsum expedita dolorum atque nemo molestiae sit? Ad optio ipsam animi suscipit iste!</p>
        </div>

      </div>
      
      
    </div> 
  )        
}    

export default About  



