import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, X } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import './AdminDashboard.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/orders', config);
            setOrders(res.data.data);
        } catch (err) {
            console.error('Fetch Orders Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchOrders();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loading">Loading Orders...</div>;

    return (
        <div className="admin-view">
            <h2>Comprehensive Order Ledger</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Update</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>
                                <button className="order-id-btn" onClick={() => setSelectedOrder(order)}>
                                    #{order._id.substring(18).toUpperCase()} <Eye size={14} />
                                </button>
                            </td>
                            <td>{order.customer?.name}</td>
                            <td>{formatPrice(order.totalPrice)}</td>
                            <td><span className={`status-pill ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></td>
                            <td>
                                <select
                                    value={order.orderStatus}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PAID">PAID</option>
                                    <option value="SHIPPED">SHIPPED</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content glass-morphism" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order Details: #{selectedOrder._id}</h3>
                            <button onClick={() => setSelectedOrder(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="order-info-section">
                                <h4>Customer Information</h4>
                                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                                <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                                <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                            </div>
                            <div className="order-items-section">
                                <h4>Items</h4>
                                {selectedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} className="modal-item">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="modal-total">
                                    <strong>Total:</strong>
                                    <strong>{formatPrice(selectedOrder.totalPrice)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
