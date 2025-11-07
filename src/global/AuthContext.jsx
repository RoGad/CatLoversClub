import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from './config.js';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/AuthCheck.php`, {
                withCredentials: true
            });
            if (response.data.success && response.data.authenticated) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/Auth.php`,
                {
                    action: 'register',
                    username: userData.username,
                    email: userData.email,
                    password: userData.password,
                    full_name: userData.full_name || ''
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, user: response.data.user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Registration failed'
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/Auth.php`,
                {
                    action: 'login',
                    login: credentials.login,
                    password: credentials.password
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, user: response.data.user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/Auth.php`,
                { action: 'logout' },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/';
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

