import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  const containerStyle = {
    maxWidth: "800px",
    margin: "32px auto 0",
    padding: "0 16px",
  };

  const paperStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)",
    padding: "32px",
  };

  const contentStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  };

  const avatarStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#1976d2",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    fontWeight: 500,
    marginBottom: "16px",
  };

  const nameStyle = {
    margin: "0 0 8px",
    fontSize: "2rem",
    fontWeight: 500,
    color: "#333",
  };

  const emailStyle = {
    margin: "0 0 24px",
    fontSize: "1rem",
    color: "#666",
  };

  const buttonContainerStyle = {
    width: "100%",
    marginTop: "24px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#f50057",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <div style={paperStyle}>
        <div style={contentStyle}>
          <div style={avatarStyle}>{user?.name?.[0]?.toUpperCase()}</div>
          <h1 style={nameStyle}>{user?.name}</h1>
          <p style={emailStyle}>{user?.email}</p>
        </div>

        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
