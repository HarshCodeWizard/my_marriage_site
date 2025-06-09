import React, { useEffect, useState } from 'react';
// import list from "../../public/list.json"; 
import '../components/Hotelscard.css'; 
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Cards from './Cards'; 
import axios from "axios";

function Hotelscard() {
  const[hotel,setHotel]=useState([])
  useEffect(()=>{
    const getHotel=async()=>{
      try{
        const res=await axios.get("http://localhost:8000/hotels");
        console.log(res.data);
        setHotel(res.data)
      }catch(error){
       console.log(error)
      }
    }
    getHotel();
  },[])
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className='Bigcard'>
        <h3 className='card'>
          Go through our, <span className='spancard'>Glorious Hotels</span>
        </h3>
      </div>

      <div>
        <Slider {...settings}>
          {hotel.map((item) => (
            <Cards item={item} key={item.id} /> 
          ))}
        </Slider>
      </div>
    </>
  );
}

export default Hotelscard;
