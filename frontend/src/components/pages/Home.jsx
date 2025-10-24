import React from 'react'
import Hero from '../Hero'
import LatestCollection from '../LatestCollection'
import BestSeller from '../BestSeller'
import OurPolicy from '../OurPolicy'


function Home() {
  return (
    <div>
      <Hero/>
      <LatestCollection/>
      <BestSeller/>
      <OurPolicy/>
      
    </div>
  )
}

export default Home