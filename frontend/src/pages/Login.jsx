import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const { user, login, verifyOtp, intent } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const errorMsg = params.get('error');
        if (errorMsg) {
            setError(errorMsg);
            // Clear the error from URL without refreshing
            window.history.replaceState({}, '', '/login');
        }
    }, [location]);

    React.useEffect(() => {
        if (user) {
            // Check for redirect param
            const params = new URLSearchParams(location.search);
            const redirectParams = params.get('redirect');

            // Checking if we just came from Google Auth (token is in URL or we just loaded with user)
            // But for Google flow, merging is tricky since we don't catch the moment of login easily here without token reference.
            // However, AuthContext handles the token set. We can trigger merge if we detect a fresh login.

            // For now, let's rely on handleOtpSubmit for manual login.
            // For Google login which redirects here with token (handled in AuthContext), 
            // we might miss it unless we check local storage token.

            if (intent === 'seller' && user.role === 'customer') {
                navigate('/seller-setup');
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'seller') {
                navigate('/seller/dashboard');
            } else if (redirectParams === 'checkout') {
                navigate('/checkout');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate, intent, location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            await login(email, password);
            setShowOtp(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            const data = await verifyOtp(email, otp);

            const params = new URLSearchParams(location.search);
            const redirectParams = params.get('redirect');

            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (data.user.role === 'seller') {
                navigate('/seller/dashboard');
            } else if (redirectParams === 'checkout') {
                navigate('/checkout');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-morphism">
                <h2>Welcome Back</h2>
                <p>Login to your Kuri-Macye account</p>

                {error && <div className="auth-error">{error}</div>}

                {!showOtp ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-options">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                            {processing ? <Loader className="animate-spin" size={20} /> : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label>Verification Code</label>
                            <p className="otp-info">We've sent a 6-digit code to <strong>{email}</strong></p>
                            <div className="input-with-icon">
                                <Lock size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setOtp(val);
                                    }}
                                    maxLength="6"
                                    minLength="6"
                                    pattern="\d{6}"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                            {processing ? <Loader className="animate-spin" size={20} /> : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-link btn-block mt-10"
                            onClick={() => setShowOtp(false)}
                            disabled={processing}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <a href="http://localhost:5000/api/auth/google" className="btn btn-outline btn-block btn-google">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                    Sign in with Google
                </a>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
