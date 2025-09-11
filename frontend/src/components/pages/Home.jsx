import React from 'react'
import Hero from '../Hero'
import LatestCollection from '../LatestCollection'
import BestSeller from '../BestSeller'
import OurPolicy from '../OurPolicy'
import NewsLetterBox from '../NewsLetterBox'

function Home() {
  return (
    <div>
      <Hero/>
      <LatestCollection/>
      <BestSeller/>
      <OurPolicy/>
      <NewsLetterBox/>
    </div>
  )
}

export default Home