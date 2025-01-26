import React from 'react'
import { createContext , useState, useEffect} from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);


  const getAuthState = async()=>{
    try {
      const {data} = await axios.get(`${backendUrl}/api/auth/is-auth`);
      console.log(data)
      if(data.success){
        setIsLoggedIn(true);
        getUserData();
      }
    } catch (error) {
      console.error(error)
      
    }
  }

  useEffect(()=>{
    getAuthState();
  },[])

  const getUserData = async() =>{
    try {
      const {data} = await axios.get(`${backendUrl}/api/user/data`);
      console.log(data.userData)
      if(data.success){
        setUserData(data.userData);
      }
      else{
        toast.error(error.message);
      }
    } catch (error) {
        toast.error(error.message);
        console.error(error)
    }
  }

  const value = {
    // Add your global state variables here
    backendUrl,
    isLoggedIn, setIsLoggedIn,
    userData, setUserData,
    getUserData
  }
  
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider;
