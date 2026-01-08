import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import './AdminDashboard.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/products/admin/all', config);
            setProducts(res.data.data);
        } catch (err) {
            console.error('Fetch Products Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        setActionLoading(id);
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchProducts();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loading">Loading Products...</div>;

    return (
        <div className="admin-view">
            <h2>Universal Product Inventory</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Seller</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id}>
                            <td className="product-cell">
                                <img src={product.imageUrl} alt={product.name} />
                                <div>
                                    <strong>{product.name}</strong>
                                    <div className="sub-text">{product.category}</div>
                                </div>
                            </td>
                            <td>{product.sellerId?.name || 'Unknown'}</td>
                            <td>{formatPrice(product.price)}</td>
                            <td>{product.stock}</td>
                            <td className="admin-actions">
                                <button className="block-btn" onClick={() => deleteProduct(product._id)} title="Delete"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProducts;
