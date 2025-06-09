import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const query = new URLSearchParams(location.search);
    const userData = query.get('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        setUser(parsedUser);
        setUserId(parsedUser._id);
        localStorage.setItem('userId', parsedUser._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    if (!userData && !storedUserId) {
      axios.get("http://localhost:8000/user/me", { withCredentials: true })
        .then(response => {
          setUserId(response.data.userId);
          localStorage.setItem('userId', response.data.userId);
        })
        .catch(error => {
          console.error("Error fetching user:", error);
          setUserId(null);
          localStorage.removeItem('userId');
        });
    }
  }, [location]);

  const logout = () => {
    axios.get("http://localhost:8000/user/logout", { withCredentials: true })
      .then(() => {
        setUserId(null);
        setUser(null);
        localStorage.removeItem('userId');
      })
      .catch(error => console.error("Error logging out:", error));
  };

  return (
    <AuthContext.Provider value={{ userId, user, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};