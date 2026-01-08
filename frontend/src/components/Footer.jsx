import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

const Footer = () => {
    const { user } = useAuth();

    return (
        <footer className="footer glass-morphism">
            <div className="container footer-content">
                <div className="footer-section">
                    <Link to="/" className="logo">
                        Kuri-<span>Macye</span>
                    </Link>
                    <p className="footer-desc">
                        The ultimate multi-vendor marketplace for premium products from local and international sellers.
                    </p>
                    <div className="social-links">
                        <a href="#"><Instagram size={20} /></a>
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Facebook size={20} /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/shop">Shop</Link></li>

                        <li>
                            <Link to={
                                !user ? '/login' :
                                    user.role === 'admin' ? '/admin/dashboard' :
                                        user.role === 'seller' ? '/seller/dashboard' :
                                            '/orders'
                            }>
                                My Account
                            </Link>
                        </li>
                        {user?.role !== 'seller' && user?.role !== 'admin' && (
                            <li><Link to="/cart">Cart</Link></li>
                        )}
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Customer Support</h3>
                    <ul>
                        <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                        <li><Link to="/return-refund">Return & Refund</Link></li>
                        <li><Link to="/terms-of-service">Terms of Service</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <ul className="contact-info">
                        <li><Mail size={16} /> info@kuri-macye.com</li>
                        <li><Phone size={16} /> +250 123 456 789</li>
                        <li><MapPin size={16} /> Kigali, Rwanda</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 Kuri-Macye. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
