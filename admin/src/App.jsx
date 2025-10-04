import React from 'react'
import Navbar from './component/Navbar'
import Sidebar from './component/Sidebar'


const App = () => {
  return (
    <div className='bg-gray-50 min-h-screen'>
      <>
      <Navbar />
      <hr />
      <div className='flex w-full'>
        <Sidebar />
      </div>
      </>
    
    </div>
  )
}

export default App
