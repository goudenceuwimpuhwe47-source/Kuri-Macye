import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setOrders(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'status-paid';
            case 'SHIPPED': return 'status-shipped';
            case 'DELIVERED': return 'status-delivered';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="loading">Loading your orders...</div>;

    return (
        <div className="orders-page container">
            <h1>My Orders</h1>
            {orders.length === 0 ? (
                <div className="no-orders glass-morphism">
                    <Package size={60} color="var(--text-muted)" />
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here.</p>
                    <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-item glass-morphism">
                            <div className="order-header">
                                <div>
                                    <span className="order-id">Order ID: #{order._id.substring(0, 8).toUpperCase()}</span>
                                    <div className="order-date"><Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className={`order-status ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </div>
                            </div>
                            <div className="order-body">
                                <div className="order-items-list-view">
                                    {order.orderItems.map((item, idx) => {
                                        const imgSrc = item.image
                                            ? (item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image)
                                            : 'https://via.placeholder.com/50';
                                        return (
                                            <div key={idx} className="order-item-detail-row">
                                                <img src={imgSrc} alt={item.name} />
                                                <div className="item-details-text">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-store">Sold by: {item.storeName}</span>
                                                    <span className="item-qty">Qty: {item.qty}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="order-info">
                                    <div className="info-block">
                                        <span>Total Amount</span>
                                        <h4>{formatPrice(order.totalPrice)}</h4>
                                    </div>
                                    <div className="info-block">
                                        <span>Items</span>
                                        <h4>{order.orderItems.length} Products</h4>
                                    </div>
                                    <Link to={`/order/${order._id}`} className="btn btn-outline btn-sm">
                                        <Eye size={16} /> View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
