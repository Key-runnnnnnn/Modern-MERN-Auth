import React from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      data.success && setIsLoggedIn(false);
      data.success && setUserData(null)
      navigate("/")

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
      if(data.success){
        navigate("/email-verify")
        toast.success(data.message);
      }
      else{
        toast.error(data.message);
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      
    }
  }

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="logo" className="w-28 sm:w-32" />

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-3 -right-4 z-10 text-black rounded p-7 w-44">
            <ul className="list-none m-0 p-0 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                onClick={sendVerificationOtp}
                >
                  Verify Email
                </li>
              )}
              <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
              onClick={logout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
          onClick={() => navigate("/login")}
        >
          Login <img src={assets.arrow_icon} alt="icon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
