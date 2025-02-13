import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <ul>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/accounts">Accounts</Link></li>
        </ul>
      </nav>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </aside>
  );
};

export default AdminSidebar;

