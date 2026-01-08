import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminSellers = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchSellers = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/sellers', config);
            setSellers(res.data.data);
        } catch (err) {
            console.error('Fetch Sellers Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const updateSellerStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await axios.put(`http://localhost:5000/api/sellers/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchSellers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loading">Loading Sellers...</div>;

    return (
        <div className="admin-view">
            <h2>Seller Management</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Store Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sellers.map(seller => (
                        <tr key={seller._id}>
                            <td><strong>{seller.storeName}</strong></td>
                            <td>{seller.user?.email}</td>
                            <td><span className={`status-pill ${seller.status.toLowerCase()}`}>{seller.status}</span></td>
                            <td className="admin-actions">
                                <select
                                    className="status-select"
                                    value={seller.status}
                                    onChange={(e) => updateSellerStatus(seller._id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminSellers;
