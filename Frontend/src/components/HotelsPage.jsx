import Cards from './Cards';
import axios from "axios";
import React,{useEffect,useState} from "react";
function HotelsPage() {
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
    };
    getHotel();
  },[])
  return (
    <>
      <div className="max-w-screen-2xl mx-[120px] px-3 border-3 border-black">
        <div>
          <h1 className="text-black text-2xl"> 
            Find your Perfect Stay,
          </h1>
        </div>
        <div className='mt-12 grid gap-14 grid-cols-3'>
          {
            hotel.map((item) => (
              <Cards key={item._id} item={item} />
            ))
          }
        </div>
      </div>
    </>
  );
}
export default HotelsPage;