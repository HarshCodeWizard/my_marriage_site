
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserId(parsedUser._id);
      console.log('AuthContext loaded user:', parsedUser, 'userId:', parsedUser._id);
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user/me', { withCredentials: true });
        console.log('Fetched user from /user/me:', response.data);
        setUser(response.data);
        setUserId(response.data._id);
        localStorage.setItem("User", JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching user:', error.response?.status, error.response?.data || error.message);
        setUser(null);
        setUserId(null);
        localStorage.removeItem("User");
      }
    };

    fetchUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setUserId(userData._id);
    localStorage.setItem("User", JSON.stringify(userData));
    console.log('AuthContext login:', userData, 'userId:', userData._id);
  };

  const logout = () => {
    setUser(null);
    setUserId(null);
    localStorage.removeItem("User");
  };

  return (
    <AuthContext.Provider value={{ user, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);