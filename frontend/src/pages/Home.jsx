import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = 'http://localhost:5000/api/products?limit=8';
                if (selectedCategory !== 'All') {
                    url += `&category=${selectedCategory}`;
                }
                const { data } = await axios.get(url);
                setProducts(data.data);
            } catch (error) {
                console.error('Error fetching products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [selectedCategory]);

    const handleSellerClick = () => {
        if (!user) {
            navigate('/signup');
        } else if (user.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user.role === 'seller') {
            navigate('/seller/dashboard');
        } else {
            navigate('/seller-setup');
        }
    };

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Discover Premium Goods from Top Sellers</h1>
                    <p>The marketplace where local craftsmanship meets global quality. Browse, buy, and experience excellence.</p>
                    <div className="hero-btns">
                        <Link to="/shop" className="btn btn-primary btn-large">
                            Explore Shop <ArrowRight size={18} />
                        </Link>
                        <button className="btn btn-outline" onClick={handleSellerClick}>
                            {user?.role === 'seller' ? 'Seller Dashboard' : 'Join as Seller'}
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-circle"></div>
                    {/* We'll add a generated image here later */}
                </div>
            </section>

            <section className="featured-section container">
                <div className="section-header">
                    <h2>Featured Products</h2>
                    <div className="filters-mini">
                        {['All', 'Electronics', 'Fashion', 'Home'].map(category => (
                            <button
                                key={category}
                                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : products.length === 0 ? (
                    <div className="no-products" style={{ textAlign: 'center', width: '100%', padding: '4rem 0', gridColumn: '1 / -1' }}>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>No products found in this category yet.</p>
                        {user?.role === 'seller' && (
                            <Link to="/seller/products/new" className="btn btn-primary btn-sm mt-4 inline-block">
                                Add First Product
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map(product => {
                            const imgSrc = product.imageUrl
                                ? (product.imageUrl.startsWith('/uploads') ? `http://localhost:5000${product.imageUrl}` : product.imageUrl)
                                : 'https://via.placeholder.com/300';
                            return (
                                <div key={product._id} className="product-card glass-morphism">
                                    <div className="product-image">
                                        <img src={imgSrc} alt={product.name} />
                                        <span className="category-tag">{product.category}</span>
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <div className="product-seller">By {product.storeName || 'Authorized Store'}</div>
                                        <div className="product-footer">
                                            <span className="product-price">{formatPrice(product.price)}</span>
                                            <Link to={`/product/${product._id}`} className="btn btn-primary btn-sm">View Details</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
