import React from "react";
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVarify from "./pages/EmailVarify";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div>
          <Home />
        </div>
      ),
    },
    {
      path: "/login",
      element: (
        <div>
          <Login />
        </div>
      ),
    },
    {
      path: "/email-verify",
      element: (
        <div>
          <EmailVarify />
        </div>
      ),
    },
    {
      path: "/reset-password",
      element: (
        <div>
          <ResetPassword />
        </div>
      ),
    },
  ]);
  return (
    <>
      <div>
        <ToastContainer />
        <RouterProvider router= {router} />
      </div>
    </>
  );
}

export default App;
