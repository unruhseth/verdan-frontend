import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const AccountDetailsMenu = () => {
    const { accountId } = useParams();  // Get account ID from URL
    const location = useLocation();
    const baseUrl = `/admin/accounts/${accountId}`;

    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const response = await fetch(`http://localhost:5000/admin/accounts/${accountId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch account details");
                }

                const data = await response.json();
                setAccount(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching account details:", error);
                setError("Failed to load account.");
                setLoading(false);
            }
        };

        fetchAccount();
    }, [accountId]);

    const activeTab = location.pathname.replace(baseUrl, "").replace("/", "") || "base";

    return (
        <div>
            {/* Account Name Display */}
            {loading ? (
                <h2>Loading...</h2>
            ) : error ? (
                <h2 className="error-message">{error}</h2>
            ) : (
                <h2 className="account-title">{account.name}</h2>
            )}

            {/* Submenu Navigation */}
            <nav className="account-submenu">
                <Link to={`${baseUrl}`} className={activeTab === "base" ? "active" : ""}>Overview</Link>
                <Link to={`${baseUrl}/users`} className={activeTab === "users" ? "active" : ""}>Users</Link>
                <Link to={`${baseUrl}/apps`} className={activeTab === "apps" ? "active" : ""}>Apps</Link>
                <Link to={`${baseUrl}/subscriptions`} className={activeTab === "subscriptions" ? "active" : ""}>Subscriptions</Link>
                <Link to={`${baseUrl}/devices`} className={activeTab === "devices" ? "active" : ""}>Devices</Link>
                <Link to={`${baseUrl}/sim-cards`} className={activeTab === "sim-cards" ? "active" : ""}>SIM Cards</Link>
            </nav>
        </div>
    );
};

export default AccountDetailsMenu;
