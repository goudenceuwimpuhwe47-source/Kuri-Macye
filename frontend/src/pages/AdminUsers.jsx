import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/sellers/users', config);
            setUsers(res.data.data);
        } catch (err) {
            console.error('Fetch Users Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateUserStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await axios.put(`http://localhost:5000/api/sellers/users/${id}`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const updateUserRole = async (id, role) => {
        setActionLoading(id);
        try {
            await axios.put(`http://localhost:5000/api/sellers/users/${id}`, { role }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loading">Loading Users...</div>;

    return (
        <div className="admin-view">
            <h2>User Access Control</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User Info</th>
                        <th>Role</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(userItem => (
                        <tr key={userItem._id}>
                            <td>
                                <strong>{userItem.name}</strong>
                                <div className="sub-text">{userItem.email}</div>
                            </td>
                            <td>
                                <select
                                    className="role-select"
                                    value={userItem.role}
                                    onChange={(e) => updateUserRole(userItem._id, e.target.value)}
                                    disabled={currentUser?._id === userItem._id}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td><span className={`status-pill ${userItem.status || 'active'}`}>{userItem.status || 'active'}</span></td>
                            <td className="admin-actions">
                                {userItem._id === currentUser?._id ? (
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Current User</span>
                                ) : userItem.status === 'blocked' ? (
                                    <button className="approve-btn" onClick={() => updateUserStatus(userItem._id, 'active')} title="Reactivate"><CheckCircle size={18} /></button>
                                ) : (
                                    <button className="block-btn" onClick={() => updateUserStatus(userItem._id, 'blocked')} title="Deactivate"><AlertCircle size={18} /></button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;
