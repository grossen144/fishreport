import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", path: "/" },
    { text: "New Report", path: "/report" },
    { text: "Profile", path: "/profile" },
  ];

  const containerStyle = {
    display: "flex",
    minHeight: "100vh",
  };

  const appBarStyle = {
    position: "fixed" as const,
    top: 0,
    right: 0,
    left: isMobile ? 0 : drawerWidth,
    height: "64px",
    backgroundColor: "#1976d2",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    zIndex: 1200,
  };

  const menuButtonStyle = {
    display: isMobile ? "block" : "none",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "8px",
    marginRight: "16px",
  };

  const titleStyle = {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 500,
  };

  const drawerStyle = {
    width: drawerWidth,
    backgroundColor: "#fff",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    position: "fixed" as const,
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1100,
    transform: isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
    transition: "transform 0.3s ease-in-out",
  };

  const drawerPaperStyle = {
    width: "100%",
    height: "100%",
    overflow: "auto",
  };

  const toolbarStyle = {
    height: "64px",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
  };

  const listStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    padding: 0,
  };

  const listItemButtonStyle = (isSelected: boolean) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    cursor: "pointer",
    backgroundColor: isSelected ? "rgba(25, 118, 210, 0.08)" : "transparent",
    border: "none",
    width: "100%",
    textAlign: "left" as const,
    color: isSelected ? "#1976d2" : "inherit",
  });

  const listItemTextStyle = {
    marginLeft: "16px",
    fontSize: "1rem",
  };

  const mainContentStyle = {
    flexGrow: 1,
    padding: "24px",
    marginLeft: isMobile ? 0 : drawerWidth,
    marginTop: "64px",
    width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
  };

  const drawer = (
    <div style={drawerStyle}>
      <div style={drawerPaperStyle}>
        <div style={toolbarStyle} />
        <ul style={listStyle}>
          {menuItems.map((item) => (
            <li key={item.text} style={listItemStyle}>
              <button
                style={listItemButtonStyle(location.pathname === item.path)}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
              >
                <span style={listItemTextStyle}>{item.text}</span>
              </button>
            </li>
          ))}
          <li style={listItemStyle}>
            <button
              style={listItemButtonStyle(false)}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <span style={listItemTextStyle}>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <header style={appBarStyle}>
        <button
          style={menuButtonStyle}
          onClick={handleDrawerToggle}
          aria-label="open drawer"
        >
          ☰
        </button>
        <h1 style={titleStyle}>Fish Report</h1>
      </header>
      {drawer}
      <main style={mainContentStyle}>{children}</main>
    </div>
  );
};

export default Layout;
