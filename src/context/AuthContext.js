import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on initial mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      // First check if we have user in localStorage
      const storedUser = authService.getUserFromStorage();
      
      if (storedUser) {
        // Verify with backend that the session is still valid
        const authCheck = await authService.checkAuth();
        if (authCheck.success) {
          // Get fresh user data
          const userData = await authService.getCurrentUser();
          if (userData.success) {
            setUser(userData.user);
            setIsAuthenticated(true);
          } else {
            // If backend fails, clear storage
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // If auth check fails, clear everything
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
  try {
    const response = await authService.register(userData);
    if (response.success) {
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      setIsAuthenticated(true);
      return {
        success: true,
        message: response.message,
        user: response.user,
      };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    return { success: false, message: error.message || "Registration failed" };
  }
};

 const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    if (response.success) {
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      setIsAuthenticated(true);
      return {
        success: true,
        message: response.message,
        user: response.user,
      };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    return { success: false, message: error.message || "Login failed" };
  }
};

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const sendVerificationOtp = async () => {
    try {
      const response = await authService.sendVerifyOtp();
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const verifyEmail = async (otp) => {
    try {
      const response = await authService.verifyEmail(otp);
      if (response.success) {
        // Update user verification status
        setUser(prev => ({ ...prev, isAccountVerified: true }));
      }
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const sendResetOtp = async (email) => {
    try {
      const response = await authService.sendResetOtp(email);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    sendVerificationOtp,
    verifyEmail,
    sendResetOtp,
    resetPassword,
    loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};