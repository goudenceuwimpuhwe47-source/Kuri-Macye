import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import './Shop.css';

import { useLocation } from 'react-router-dom';

const Shop = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize filters from URL parameters
    const getInitialFilters = () => {
        const params = new URLSearchParams(location.search);
        return {
            search: params.get('search') || '',
            category: params.get('category') || '',
            minPrice: params.get('minPrice') || '',
            maxPrice: params.get('maxPrice') || '',
            sort: '-createdAt'
        };
    };

    const [filters, setFilters] = useState(getInitialFilters());

    // Standardized categories list
    const categories = [
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Computers', label: 'Computers & Laptops' },
        { value: 'Phones', label: 'Phones & Tablets' },
        { value: 'Fashion', label: 'Fashion & Clothing' },
        { value: 'Home', label: 'Home & Office' },
        { value: 'Beauty', label: 'Health & Beauty' },
        { value: 'Sports', label: 'Sports & Outdoors' },
        { value: 'Automotive', label: 'Automotive' },
        { value: 'Toys', label: 'Toys & Hobbies' },
        { value: 'Books', label: 'Books & Media' },
        { value: 'Groceries', label: 'Groceries' },
        { value: 'Other', label: 'Other' }
    ];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = `http://localhost:5000/api/products?sort=${filters.sort}`;
            if (filters.search) query += `&search=${filters.search}`;
            if (filters.category) query += `&category=${filters.category}`;
            if (filters.minPrice) query += `&minPrice=${filters.minPrice}`;
            if (filters.maxPrice) query += `&maxPrice=${filters.maxPrice}`;

            const { data } = await axios.get(query);
            setProducts(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Update filters when URL changes
    useEffect(() => {
        setFilters(getInitialFilters());
    }, [location.search]);

    // Fetch products when filters change (including those from URL)
    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    return (
        <div className="shop-page container">
            <div className="shop-header">
                <h1>All Products</h1>
                <p>Explore the wide selection from our trusted sellers</p>
            </div>

            <div className="shop-layout">
                <aside className="filters-sidebar glass-morphism">
                    <div className="filter-group">
                        <h3>Categories</h3>
                        <div className="category-links">
                            <button
                                className={filters.category === '' ? 'active' : ''}
                                onClick={() => setFilters({ ...filters, category: '' })}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    className={filters.category === cat.value ? 'active' : ''}
                                    onClick={() => setFilters({ ...filters, category: cat.value })}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>Price Range</h3>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                        <button className="btn btn-primary btn-sm btn-block" onClick={fetchProducts}>Apply</button>
                    </div>
                </aside>

                <main className="shop-main">
                    <div className="shop-controls glass-morphism">
                        <form className="search-box" onSubmit={handleSearch}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                            <button type="submit">Search</button>
                        </form>

                        <div className="sort-box">
                            <SlidersHorizontal size={18} />
                            <select
                                value={filters.sort}
                                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="-averageRating">Best Rated</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="no-products glass-morphism">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms.</p>
                            <button className="btn btn-outline" onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' })}>Clear All Filters</button>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {products.map(product => {
                                const imgSrc = product.imageUrl
                                    ? (product.imageUrl.startsWith('/uploads') ? `http://localhost:5000${product.imageUrl}` : product.imageUrl)
                                    : 'https://via.placeholder.com/300';
                                return (
                                    <Link key={product._id} to={`/product/${product._id}`} className="product-card glass-morphism">
                                        <div className="product-image">
                                            <img src={imgSrc} alt={product.name} />
                                            <span className="category-tag">{product.category}</span>
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <div className="product-seller">By {product.storeName || 'Store'}</div>
                                            <div className="product-footer">
                                                <span className="product-price">{formatPrice(product.price)}</span>
                                                <button className="btn btn-primary btn-sm">View</button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};


export default Shop;
