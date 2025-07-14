import React, { useEffect, useState } from "react";
import "./style.css"
import Navbar from "./components/Navbar";
import {Routes,Link,Outlet,Route } from "react-router-dom";
import Login from "./components/login";
import Reporter from "./components/Reporter/Reporter";
import Dashboard from "./components/Reporter/Dashboard";
import ReportIssue from "./components/Reporter/ReportIssue";
import MyIssues from "./components/Reporter/MyIssues";
import Profile from "./components/Reporter/Profile"
export default function App() {
  const role = "maintainer"; // dynamically fetch from auth or context

  return (
    <>
    {/* <Navbar/> */}
     <Routes>
      <Route path="/" element={<Login />} />

      {/* Nested routes for Reporter */}
      <Route path="reporter" element={<Reporter />}>
        <Route index element={<Dashboard />} /> {/* Default route */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="myissues" element={<MyIssues />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="logout" element={<Login />} />
    </Routes>
    </>
  );
}
