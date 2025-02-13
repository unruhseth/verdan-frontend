import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import AdminSidebar from "../components/AdminSidebar";
import { useAuth } from "../hooks/useAuth";

const AdminDashboard = () => {
    return (
      <div className="admin-container">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="content">
          <Routes>
            <Route index element={<DashboardHome />} />
          </Routes>
        </main>
      </div>
    );
  };
  
  export default AdminDashboard;
