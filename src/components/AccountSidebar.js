import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

const AccountSidebar = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const location = useLocation();
  const { userRole } = usePermissions();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("accountId");
    navigate("/login");
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'account_admin') {
      return [
        { path: 'dashboard', label: 'Dashboard' },
        { path: 'users', label: 'Users' },
        { path: 'apps', label: 'Apps' },
        { path: 'devices', label: 'Devices' },
        { path: 'sim-cards', label: 'SIM Cards' },
        { path: 'subscriptions', label: 'Subscriptions' }
      ];
    }
    
    // Regular user menu items
    return [
      { path: 'dashboard', label: 'Dashboard' },
      { path: 'users', label: 'Users' },
      { path: 'apps', label: 'Apps' },
      { path: 'devices', label: 'Devices' }
    ];
  };

  const isActive = (path) => {
    return location.pathname === `/account/${accountId}/${path}`;
  };

  return (
    <aside className="sidebar">
      <h2>Account Panel</h2>
      <nav>
        <ul>
          {getMenuItems().map(item => (
            <li key={item.path}>
              <Link
                to={`/account/${accountId}/${item.path}`}
                className={isActive(item.path) ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </aside>
  );
};

export default AccountSidebar; 