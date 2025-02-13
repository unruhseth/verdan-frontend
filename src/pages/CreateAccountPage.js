import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/styles.css";  // Ensure styles are correctly imported

const CreateAccountPage = () => {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/accounts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify({ name, subdomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to create account: ${response.status}`);
      }

      const data = await response.json();
      console.log("Account created:", data);

      setSuccess("Account created successfully!");
      setTimeout(() => navigate("/admin/accounts"), 1500);

    } catch (err) {
      console.error("Error creating account:", err);
      setError(err.message || "Failed to create account.");
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="create-account-container">
        <form className="create-account-form" onSubmit={handleSubmit}>
          <h2>Create New Account</h2>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <label>
            Account Name:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </label>
          <label>
            Subdomain:
            <input 
              type="text" 
              value={subdomain} 
              onChange={(e) => setSubdomain(e.target.value)} 
              required 
            />
          </label>
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;
