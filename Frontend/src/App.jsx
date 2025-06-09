import React, { useEffect } from 'react';
import Home from './home/Home'
import Hotels from './hotels/Hotels';
import { Toaster } from "react-hot-toast";
import HotelDetails from './components/Hoteldetails';
import Caterers from './caterers/Caterers';
import Decorators from './decorators/Decorators';
import {Route,Routes} from "react-router-dom"
import Signup from './components/Signup';
import Login from './components/Login'
import { messaging } from './firebase';
import {getToken} from 'firebase/messaging'
import VerifyEmail from "./components/VerifyEmail.jsx";
import Profile from "./components/Profile.jsx"
import CaterersDetails from "./components/Caterersdetails.jsx"
import DecoratorsDetails from "./components/Decoratorsdetails.jsx"


 function App() {
  async function requestpermission() {
    const permission =await Notification.requestPermission();
    if(permission==='granted')
    {
    const token =await getToken(messaging ,{vapidKey:'BHWr50c5gFRwmNmhDd4rjwbuZo0h1n_YrVRIrUoaMYy1y8kOVNis0AZalgKOll4DNoDqnhAhi_aHGrJRaLtxQxw'});
    console.log("token",token)
    }else if(permission==='denied'){
      alert("permission denied")
    }
  }
  useEffect(() =>{
     requestpermission();

  },[])
  return (
    <>
    
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Hotels" element={<Hotels/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/Sign Up" element={<Signup/>}/>
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
       
        <Route path="/hotels/:id" element={<HotelDetails/>} />
        <Route path="/Caterers" element={<Caterers/>} />
        <Route path="/Decorators" element={<Decorators/>} />
        <Route path="/Profile" element={<Profile/>} />
        <Route path="/caterers/:id" element={<CaterersDetails/>} />
        <Route path="/decorators/:id" element={<DecoratorsDetails/>} />

      </Routes>
     


      <Toaster />
    </>
  );
}

export default App;