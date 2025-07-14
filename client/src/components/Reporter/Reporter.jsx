import React, { useEffect, useState } from "react";
import axios from "axios";
import {Routes,Link,Outlet,Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
 const Reporter = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get("http://localhost:3000/reporter")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Not authenticated:", err);
        navigate("/");  // Redirect to login if unauthorized
      });
  }, []);

  return (
    <>
    <Navbar role="reporter"/>
      <Outlet />
  </>);
};

export default Reporter;
