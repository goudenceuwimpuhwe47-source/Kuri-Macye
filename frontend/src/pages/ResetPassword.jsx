import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Hash, Loader } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        otp: '',
        password: ''
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            await axios.put('http://localhost:5000/api/auth/resetpassword', formData);
            navigate('/login', { state: { message: 'Password reset successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-morphism">
                <h2>Set New Password</h2>
                <p>Enter the 6-digit code we sent to your email and your new password.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Hash size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>OTP Code</label>
                        <div className="input-with-icon">
                            <Hash size={18} />
                            <input
                                type="text"
                                placeholder="123456"
                                maxLength="6"
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                        {processing ? <Loader className="animate-spin" size={20} /> : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
