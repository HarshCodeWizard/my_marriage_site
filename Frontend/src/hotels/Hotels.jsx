import React from 'react'
import Navbar from '../components/Navbar.jsx'
import HotelsPage from '../components/HotelsPage.jsx'
import Footer from '../components/Footer.jsx'


function Hotels() {
  return (
    <div className="bg-white min-h-screen">
      <h1 className="text-black text-3xl font-bold"></h1>
      <div className="max-w-screen-2xl mx-[120px] px-3 mt-[px]">
        <Navbar />
      </div>
      <div className='min-h-screen mx-[60px]'><HotelsPage /></div>
      <Footer />
    </div>
  )
}

export default Hotels
