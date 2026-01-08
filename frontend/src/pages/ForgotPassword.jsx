import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Loader, CheckCircle } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setProcessing(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-page">
                <div className="auth-card glass-morphism">
                    <CheckCircle size={60} color="var(--primary)" style={{ marginBottom: '2rem' }} />
                    <h2>Check Your Email</h2>
                    <p>We've sent a 6-digit OTP to {email}. It expires in 10 minutes.</p>
                    <Link to="/reset-password" state={{ email }} className="btn btn-primary btn-block">
                        Enter OTP & Reset Password
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card glass-morphism">
                <h2>Reset Password</h2>
                <p>Enter your email address and we'll send you an OTP code to reset your password.</p>

                {error && <div className="auth-error">{error}</div>}

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

                    <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                        {processing ? <Loader className="animate-spin" size={20} /> : 'Send OTP'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password? <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
