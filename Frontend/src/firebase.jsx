import { initializeApp } from "firebase/app";
import {getMessaging} from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyAzobPrRJZXE1jbfXWqnhaaClpmuduyF7k",
    authDomain: "lovelockedin-4b769.firebaseapp.com",
    projectId: "lovelockedin-4b769",
    storageBucket: "lovelockedin-4b769.appspot.com",
    messagingSenderId: "797732720387",
    appId: "1:797732720387:web:07fc332f5bf680be4ba336",
    measurementId: "G-FEWZXP8259"
  };

  export const app=initializeApp(firebaseConfig);
  export const messaging=getMessaging(app);
  