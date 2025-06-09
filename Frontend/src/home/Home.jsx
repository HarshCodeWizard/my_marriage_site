import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Hotelscard from '../components/Hotelscard'
import Footer from '../components/Footer'
function Home() {
  return (
    <>
    <div className='relative'>
        <Hero />
        <div className='absolute top-0 left-0 right-0'>
          <Navbar />
          
        </div>
      </div>
      <Hotelscard /> 
      <Footer />
    </>
  )
}

export default Home;
