import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { StartTripForm } from "./pages/StartFishingTripForm";
import { ActiveTrip } from "./pages/ActiveFishingTrip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/start-trip"
                  element={
                    <PrivateRoute>
                      <StartTripForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/active-trip/:id"
                  element={
                    <PrivateRoute>
                      <ActiveTrip />
                    </PrivateRoute>
                  }
                />
                {/* <Route
                  path="/report"
                  element={
                    <PrivateRoute>
                      <ReportForm />
                    </PrivateRoute>
                  }
                /> */}
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
