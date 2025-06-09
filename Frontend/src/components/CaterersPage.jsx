import Cards1 from './Cards1';
import axios from "axios";
import React,{useEffect,useState} from "react";
function CaterersPage() {
  const[caterer,setCaterer]=useState([])
  useEffect(()=>{
    const getCaterer=async()=>{
      try{
        const res=await axios.get("http://localhost:8000/caterers");
        console.log(res.data);
        setCaterer(res.data)
      }catch(error){
       console.log(error)
      }
    };
    getCaterer();
  },[])
  return (
    <>
      <div className="max-w-screen-2xl mx-[120px] px-3 border-3 border-black">
        <div>
          <h1 className="text-black text-2xl"> 
            Find your Perfect Dish,
          </h1>
        </div>
        <div className='mt-12 grid gap-14 grid-cols-3'>
          {
            caterer.map((item) => (
              <Cards1 key={item._id} item={item} />
            ))
          }
        </div>
        
      </div>
    </>
  );
}
export default CaterersPage;