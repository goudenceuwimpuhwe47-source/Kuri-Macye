import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [intent, setIntent] = useState(null);

    useEffect(() => {
        // Check for token in URL (Google OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const intentParam = urlParams.get('intent');

        const token = urlToken || localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    if (intentParam) setIntent(intentParam);
                    localStorage.setItem('token', token);
                    fetchUser(token);
                    // Clean up URL if token was there
                    if (urlToken) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }
            } catch (err) {
                logout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data.user);
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        return data; // Return data (contains success message and email)
    };

    const verifyOtp = async (email, otp) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', userData);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, intent, setIntent, login, register, logout, verifyOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
