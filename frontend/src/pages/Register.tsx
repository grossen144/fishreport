import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register(email, password, name);
      navigate("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  const containerStyle = {
    maxWidth: "400px",
    margin: "64px auto 0",
    padding: "0 16px",
  };

  const paperStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)",
    padding: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: "100%",
  };

  const titleStyle = {
    margin: "0 0 24px",
    fontSize: "1.5rem",
    fontWeight: 500,
    color: "#333",
  };

  const formStyle = {
    width: "100%",
    marginTop: "8px",
  };

  const inputGroupStyle = {
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.875rem",
    color: "#666",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  };

  const errorStyle = {
    color: "#d32f2f",
    marginTop: "8px",
    fontSize: "0.875rem",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: "24px",
    marginBottom: "16px",
  };

  const linkContainerStyle = {
    textAlign: "center" as const,
  };

  const linkStyle = {
    color: "#1976d2",
    textDecoration: "none",
    fontSize: "0.875rem",
  };

  return (
    <div style={containerStyle}>
      <div style={paperStyle}>
        <h1 style={titleStyle}>Sign up</h1>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="name" style={labelStyle}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          {error && <div style={errorStyle}>{error}</div>}
          <button type="submit" style={buttonStyle}>
            Sign Up
          </button>
          <div style={linkContainerStyle}>
            <a href="/login" style={linkStyle}>
              Already have an account? Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
