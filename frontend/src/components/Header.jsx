import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Header.css';

const Header = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    const updateCartCount = async () => {
        if (user) {
            // Check for guest cart to merge
            const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            if (guestCart.length > 0) {
                try {
                    const token = localStorage.getItem('token');
                    for (const item of guestCart) {
                        await axios.post('http://localhost:5000/api/cart',
                            { productId: item.product, qty: item.qty },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                    localStorage.removeItem('guestCart');
                    window.dispatchEvent(new Event('cartUpdated'));
                } catch (err) {
                    console.error('Failed to merge guest cart', err);
                }
            }

            try {
                const { data } = await axios.get('http://localhost:5000/api/cart', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCartCount(data.data.cartItems.length);
            } catch (err) {
                setCartCount(0);
            }
        } else {
            const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            setCartCount(guestCart.length);
        }
    };

    useEffect(() => {
        updateCartCount();

        const handleCartUpdate = () => updateCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('storage', handleCartUpdate); // For cross-tab updates

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleCartUpdate);
        };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search works alone
        navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSearchCategory(category);
        // Category works alone
        if (category) {
            navigate(`/shop?category=${encodeURIComponent(category)}`);
        } else {
            navigate('/shop');
        }
    };

    return (
        <header className="header glass-morphism">
            <div className="container header-content">
                <Link to="/" className="logo">
                    Kuri-<span>Macye</span>
                </Link>

                {user?.role !== 'admin' && user?.role !== 'seller' && (
                    <form className="search-bar glass-morphism" onSubmit={handleSearch}>
                        <select
                            className="category-select"
                            value={searchCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Computers">Computers & Laptops</option>
                            <option value="Phones">Phones & Tablets</option>
                            <option value="Fashion">Fashion & Clothing</option>
                            <option value="Home">Home & Office</option>
                            <option value="Beauty">Health & Beauty</option>
                            <option value="Sports">Sports & Outdoors</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Toys">Toys & Hobbies</option>
                            <option value="Books">Books & Media</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="search-divider"></div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit"><Search size={20} /></button>
                    </form>
                )}

                <nav className="nav-links">
                    {user?.role !== 'admin' && user?.role !== 'seller' && (
                        <>
                            <Link to="/shop" className="nav-link">Shop</Link>
                            <Link to="/cart" className="nav-icon" title="Cart">
                                <ShoppingCart size={22} />
                                {cartCount > 0 && <span className="badge">{cartCount}</span>}
                            </Link>
                        </>
                    )}

                    {!loading && (
                        user ? (
                            <div className="user-nav">
                                {user.role === 'admin' && (
                                    <Link to="/admin/dashboard" className="nav-icon admin-icon" title="Admin Panel">
                                        <ShieldAlert size={22} />
                                    </Link>
                                )}
                                {user.role === 'seller' && (
                                    <Link to="/seller/dashboard" className="nav-icon seller-icon" title="Seller Dashboard">
                                        <LayoutDashboard size={22} />
                                    </Link>
                                )}
                                {user.role !== 'admin' && user.role !== 'seller' && (
                                    <Link to="/orders" className="nav-icon" title="My Account">
                                        <User size={22} />
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="nav-icon logout-btn" title="Logout">
                                    <LogOut size={22} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm login-btn">Login</Link>
                        )
                    )}

                    <button className="mobile-menu-btn">
                        <Menu size={24} />
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
