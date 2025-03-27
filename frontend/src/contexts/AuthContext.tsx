import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3003/api/auth/verify",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3003/api/auth/login",
        {
          email,
          password,
        }
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3003/api/auth/register",
        {
          email,
          password,
          name,
        }
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
