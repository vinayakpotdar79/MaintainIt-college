import React, { useEffect, useState } from "react";
import "./style.css"
import {Routes,Link,Outlet,Route } from "react-router-dom";
import Login from "./components/login";
import Reporter from "./components/Reporter/Reporter";
import Dashboard from "./components/Reporter/Dashboard";
import ReportIssue from "./components/Reporter/ReportIssue";
import MyIssues from "./components/Reporter/MyIssues";
import Profile from "./components/Reporter/Profile";
import Maintainer from "./components/Maintainer/Maintainer"
import Mdashboard from "./components/Maintainer/Mdashboard";
import AssignedIssues from "./components/Maintainer/AssignedIssues";
import Admin from "./components/Admin/Admin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Manageusers from "./components/Admin/Manageusers";
export default function App() {
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
        {/* Nested routes for Maintainer */}
      <Route path="maintainer" element={<Maintainer />}>
        <Route index element={<Mdashboard />} /> {/* Default route */}
        <Route path="dashboard" element={<Mdashboard />} />
        <Route path="assigned-issues" element={<AssignedIssues/>}/>
        <Route path="profile" element={<Profile />} />
      </Route>
       <Route path="admin" element={<Admin />}>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      {/* <Route path="issues" element={<AllIssues />} /> */}
     <Route path="users" element={<Manageusers />} />
      <Route path="profile" element={<Profile />} />
</Route>
      <Route path="logout" element={<Login />} />
    </Routes>
    </>
  );
}
