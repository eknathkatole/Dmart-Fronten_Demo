import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('dmart_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dmart_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('dmart_token', token);
    } else {
      localStorage.removeItem('dmart_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dmart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dmart_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/login', { email, password });
      const authData = res.data;
      setToken(authData.accessToken);
      const userData = {
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      };
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const sendRegistrationOtp = async (name, email, password, confirmPassword, phone) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/register/send-otp', {
        name,
        email,
        password,
        confirmPassword,
        phone,
      });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistrationOtp = async (name, email, password, confirmPassword, phone, otp) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/register/verify-otp', {
        name,
        email,
        password,
        confirmPassword,
        phone,
        otp,
      });
      const authData = res.data;
      setToken(authData.accessToken);
      const userData = {
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      };
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const applyForStaff = async (name, email, phone, storeName, reason) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/staff-request', {
        name,
        email,
        phone,
        storeName,
        reason,
      });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, confirmPassword, phone) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/register', { 
        name, 
        email, 
        password, 
        confirmPassword, 
        phone 
      });
      const authData = res.data;
      setToken(authData.accessToken);
      const userData = {
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      };
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/forgot-password', { email });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const createUserWithRole = async (name, email, password, phone, role) => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/api/v1/admin/users?role=${role}`, {
        name,
        email,
        password,
        confirmPassword: password,
        phone,
      });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dmart_token');
    localStorage.removeItem('dmart_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        applyForStaff,
        forgotPassword,
        resetPassword,
        createUserWithRole,
        logout,
        isAuthenticated: !!token,
        isCustomer: user?.role === 'CUSTOMER',
        isStaff: user?.role === 'STAFF' || user?.role === 'ADMIN',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
