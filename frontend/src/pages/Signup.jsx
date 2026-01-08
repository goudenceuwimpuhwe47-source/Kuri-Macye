import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader, User, Store, Phone } from 'lucide-react';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        storeName: '',
        storeDescription: '',
        phone: ''
    });
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const { register, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            await register(formData);
            setShowOtp(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            const data = await verifyOtp(formData.email, otp);
            if (data.user.role === 'seller') {
                navigate('/seller/dashboard'); // Go to dashboard if already a seller
            } else if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
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
                <h2>{showOtp ? 'Verify Email' : 'Create Account'}</h2>
                <p>{showOtp ? `Enter code sent to ${formData.email}` : 'Join the Kuri-Macye marketplace today'}</p>

                {error && <div className="auth-error">{error}</div>}

                {!showOtp ? (
                    <form onSubmit={handleSubmit}>
                        <div className="role-selector">
                            <div
                                className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'customer' })}
                            >
                                <h4>Customer</h4>
                                <p>I want to buy</p>
                            </div>
                            <div
                                className={`role-option ${formData.role === 'seller' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'seller' })}
                            >
                                <h4>Seller</h4>
                                <p>I want to sell</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {formData.role === 'seller' && (
                            <>
                                <div className="form-group">
                                    <label>Store Name</label>
                                    <div className="input-with-icon">
                                        <Store size={18} />
                                        <input
                                            type="text"
                                            placeholder="My Awesome Store"
                                            value={formData.storeName}
                                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Store Description</label>
                                    <div className="input-with-icon">
                                        <textarea
                                            placeholder="Tell customers about your store..."
                                            value={formData.storeDescription}
                                            onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                                            required
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', padding: '10px 0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <div className="input-with-icon">
                                        <Phone size={18} />
                                        <input
                                            type="text"
                                            placeholder="078XXXXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                            {processing ? <Loader className="animate-spin" size={20} /> : 'Create Account'}
                        </button>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <a href={`http://localhost:5000/api/auth/google?role=${formData.role}`} className="btn btn-outline btn-block btn-google">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                            Sign up with Google
                        </a>

                        <p className="auth-footer">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label>Verification Code</label>
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
                            {processing ? <Loader className="animate-spin" size={20} /> : 'Verify Account'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-link btn-block mt-10"
                            onClick={() => setShowOtp(false)}
                            disabled={processing}
                        >
                            Back to Signup
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;
