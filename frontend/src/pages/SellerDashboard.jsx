import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Package, ShoppingBag, X, User, Store, Phone as PhoneIcon, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import './SellerDashboard.css';

const CATEGORIES = [
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

const SellerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [sellerProfile, setSellerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('products'); // 'products' | 'orders' | 'profile'
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Product Form Data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: ''
    });

    // Profile Form Data
    const [profileData, setProfileData] = useState({
        storeName: '',
        storeDescription: '',
        phone: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Products
            const prodRes = await axios.get('http://localhost:5000/api/products/seller/my-products', { headers });
            setProducts(prodRes.data.data);

            // Fetch Orders
            const ordRes = await axios.get('http://localhost:5000/api/orders/seller/my-orders', { headers });
            setOrders(ordRes.data.data);

            // Fetch Profile
            const profileRes = await axios.get('http://localhost:5000/api/sellers/profile', { headers });
            setSellerProfile(profileRes.data.data);
            setProfileData({
                storeName: profileRes.data.data.storeName,
                storeDescription: profileRes.data.data.storeDescription,
                phone: profileRes.data.data.phone
            });
            if (profileRes.data.data.logoUrl) {
                setProfilePreview(`http://localhost:5000${profileRes.data.data.logoUrl}`);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    // Product Handlers
    const handleEditClick = (product) => {
        setIsEditing(true);
        setCurrentProductId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category
        });
        setImagePreview(product.imageUrl ? `http://localhost:5000${product.imageUrl}` : '');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                showNotification('Product deleted successfully');
                fetchData();
            } catch (err) {
                showNotification('Error deleting product', 'error');
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('category', formData.category);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };

            if (isEditing) {
                await axios.put(`http://localhost:5000/api/products/${currentProductId}`, data, config);
                showNotification('Product updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/products', data, config);
                showNotification('Product created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Error saving product';
            showNotification(errMsg, 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', stock: '', category: '' });
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setCurrentProductId(null);
    };

    // Order Handlers
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/shipping`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            showNotification('Status updated');
            fetchData();
        } catch (err) {
            showNotification('Error updating status', 'error');
        }
    };

    // Profile Handlers
    const handleProfileFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('storeName', profileData.storeName);
            data.append('storeDescription', profileData.storeDescription);
            data.append('phone', profileData.phone);
            if (profileImage) {
                data.append('image', profileImage);
            }

            await axios.post('http://localhost:5000/api/sellers/profile', data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            showNotification('Profile updated successfully');
            fetchData(); // Refresh to get new logo url
        } catch (err) {
            showNotification(err.response?.data?.error || 'Error updating profile', 'error');
        }
    };

    const calculateEarnings = () => {
        return orders.reduce((acc, order) => {
            const sellerItems = order.orderItems.filter(item => item.seller?.toString() === user?._id);
            return acc + sellerItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        }, 0);
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="seller-dashboard container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Seller Dashboard</h1>
                    <p className="subtitle">Welcome back, {sellerProfile?.storeName || user?.name}</p>
                </div>
                <div className="stats-grid">
                    <div className="stat-card glass-morphism">
                        <Package size={24} color="var(--primary)" />
                        <div>
                            <span>Total Products</span>
                            <h3>{products.length}</h3>
                        </div>
                    </div>
                    <div className="stat-card glass-morphism">
                        <ShoppingBag size={24} color="var(--accent)" />
                        <div>
                            <span>Active Orders</span>
                            <h3>{orders.length}</h3>
                        </div>
                    </div>
                    <div className="stat-card glass-morphism">
                        <ShoppingBag size={24} color="#22c55e" />
                        <div>
                            <span>Total Earnings</span>
                            <h3>{formatPrice(calculateEarnings())}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <aside className="dashboard-nav glass-morphism">
                    <button className={view === 'products' ? 'active' : ''} onClick={() => setView('products')}>
                        <Package size={18} /> My Products
                    </button>
                    <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>
                        <ShoppingBag size={18} /> Customer Orders
                    </button>
                    <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>
                        <Store size={18} /> Store Profile
                    </button>
                </aside>

                <main className="dashboard-main glass-morphism">
                    {view === 'products' && (
                        <div className="products-view">
                            <div className="view-header">
                                <h2>My Products</h2>
                                <button className="btn btn-primary add-prod-btn-inline" onClick={() => { resetForm(); setShowModal(true); }}>
                                    <Plus size={18} /> Add New Product
                                </button>
                            </div>
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <td className="prod-cell">
                                                <img src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : 'https://via.placeholder.com/40'} alt="" />
                                                {product.name}
                                            </td>
                                            <td>{product.category}</td>
                                            <td>{formatPrice(product.price)}</td>
                                            <td>{product.stock}</td>
                                            <td className="actions-cell">
                                                <button className="edit-btn" onClick={() => handleEditClick(product)}><Edit2 size={16} /></button>
                                                <button className="delete-btn" onClick={() => handleDelete(product._id)}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr><td colSpan="5" className="text-center">No products found. Start selling today!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'orders' && (
                        <div className="orders-view">
                            <h2>Customer Orders</h2>
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Shipping</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td className="id-cell">#{order._id.substring(0, 8).toUpperCase()}</td>
                                            <td>{order.customer?.name || 'Guest'}</td>
                                            <td>{order.orderItems.filter(i => i.seller?.toString() === user?._id).length} items</td>
                                            <td>{formatPrice(order.totalPrice)}</td>
                                            <td>
                                                <span className={`status-badge ${order.isPaid ? 'paid' : 'pending'}`}>
                                                    {order.isPaid ? 'PAID' : 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={order.shippingStatus || 'PENDING'}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    className={`status-select ${order.shippingStatus?.toLowerCase()}`}
                                                >
                                                    <option value="NOT_SHIPPED">Processing</option>
                                                    <option value="IN_TRANSIT">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan="6" className="text-center">No orders yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'profile' && (
                        <div className="profile-view">
                            <h2>Store Profile</h2>
                            <form onSubmit={handleProfileSubmit} className="profile-form">
                                <div className="profile-header-section">
                                    <div className="profile-image-upload">
                                        <div className="image-preview">
                                            {profilePreview ? (
                                                <img src={profilePreview} alt="Store Logo" />
                                            ) : (
                                                <Store size={40} color="#ccc" />
                                            )}
                                        </div>
                                        <label htmlFor="logo-upload" className="upload-btn">
                                            <Upload size={16} /> Upload Logo
                                        </label>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileFileChange}
                                            hidden
                                        />
                                    </div>
                                    <div className="profile-info-text">
                                        <p>Upload a professional logo to build trust.</p>
                                        <p className="text-sm text-muted">Recommended size: 500x500px</p>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Store Name</label>
                                        <div className="input-with-icon">
                                            <Store size={18} />
                                            <input
                                                type="text"
                                                value={profileData.storeName}
                                                onChange={(e) => setProfileData({ ...profileData, storeName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Contact Phone</label>
                                        <div className="input-with-icon">
                                            <PhoneIcon size={18} />
                                            <input
                                                type="text"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Store Description</label>
                                        <textarea
                                            value={profileData.storeDescription}
                                            onChange={(e) => setProfileData({ ...profileData, storeDescription: e.target.value })}
                                            rows="4"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-morphism">
                        <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleProductSubmit} className="product-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (Rwf)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required={!isEditing}
                                    />
                                    {imagePreview && (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="Preview" className="form-image-preview" />
                                        </div>
                                    )}
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
