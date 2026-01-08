import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Store, Phone, Loader, ArrowRight } from 'lucide-react';
import './SellerSetup.css';

const SellerSetup = () => {
    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        phone: ''
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const { logout } = useAuth(); // Fallback if something goes wrong
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/sellers/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Success! 
            alert('Your store request has been submitted. Please wait for admin approval.');
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create seller profile');
            setProcessing(false);
        }
    };

    return (
        <div className="auth-page setup-page">
            <div className="auth-card glass-morphism seller-setup-card">
                <div className="setup-header">
                    <div className="icon-badge">
                        <Store size={32} color="var(--primary)" />
                    </div>
                    <h2>Complete Your Seller Profile</h2>
                    <p>Just a few more details to start selling on Kuri-Macye</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Store Name</label>
                        <div className="input-with-icon">
                            <Store size={18} />
                            <input
                                type="text"
                                placeholder="e.g. Sunny Electronics"
                                value={formData.storeName}
                                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Store Description</label>
                        <textarea
                            placeholder="Briefly describe what you sell..."
                            value={formData.storeDescription}
                            onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                            required
                        />
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

                    <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                        {processing ? <Loader className="animate-spin" size={20} /> : (
                            <>
                                Launch Store <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn btn-link btn-block mt-10"
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                    >
                        Cancel & Logout
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerSetup;
