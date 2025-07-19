import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import axios from "axios";
import Footer from "../../Footer";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/admin", { withCredentials: true })
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) =>
        {   console.error("Not authenticated:", err);
           navigate("/")})
  }, []);

  return (
    <>
      <Navbar role="admin" />
      <Outlet />
      <Footer/>
    </>
  );
};

export default Admin;
