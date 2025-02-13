import React from "react";
import { useParams } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";
import AdminSidebar from "../components/AdminSidebar";
import AccountDetailsMenu from "../components/AccountDetailsMenu";
import { usePermissions } from "../hooks/usePermissions";

const AccountDetailsPage = () => {
    const { accountId } = useParams();
    const { isAdmin } = usePermissions();
    const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;

    return (
        <div className="admin-container">
            <Sidebar />
            <main className="content">
                {isAdmin() && <AccountDetailsMenu />}
                <div className="account-details">
                    <h2>Dashboard</h2>
                    <div className="dashboard-content">
                        {/* Dashboard content will be added here later */}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccountDetailsPage;
