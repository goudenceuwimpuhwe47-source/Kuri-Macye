import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, CreditCard, ArrowLeft, Clock, MapPin, Phone, User } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import './Orders.css';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setOrder(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'status-paid';
            case 'SHIPPED': return 'status-shipped';
            case 'DELIVERED': return 'status-delivered';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="loading">Loading order details...</div>;
    if (!order) return <div className="container"><h2>Order not found</h2></div>;

    return (
        <div className="order-detail-page container">
            <Link to="/orders" className="back-btn"><ArrowLeft size={18} /> Back to Orders</Link>

            <div className="order-detail-header">
                <h1>Order #{order._id.substring(0, 8).toUpperCase()}</h1>
                <span className={`order-status ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                </span>
            </div>

            <div className="order-detail-grid">
                <div className="order-detail-main">
                    <div className="detail-section glass-morphism">
                        <h3><Package size={20} /> Order Items</h3>
                        <div className="order-items-list">
                            {order.orderItems.map((item, idx) => {
                                const imgSrc = item.image
                                    ? (item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image)
                                    : 'https://via.placeholder.com/80';
                                return (
                                    <div key={idx} className="order-item-row">
                                        <img src={imgSrc} alt={item.name} />
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <span className="qty">Qty: {item.qty}</span>
                                        </div>
                                        <span className="item-price">{formatPrice(item.price * item.qty)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="detail-section glass-morphism">
                        <h3><Truck size={20} /> Shipping Information</h3>
                        <div className="shipping-info">
                            <div className="info-row">
                                <User size={16} />
                                <span>{order.shippingAddress?.fullName}</span>
                            </div>
                            <div className="info-row">
                                <Phone size={16} />
                                <span>{order.shippingAddress?.phone}</span>
                            </div>
                            <div className="info-row">
                                <MapPin size={16} />
                                <span>{order.shippingAddress?.addressLine}, {order.shippingAddress?.city}</span>
                            </div>
                        </div>
                        <div className="shipping-status">
                            <span>Shipping Status:</span>
                            <strong className={`${order.shippingStatus === 'DELIVERED' ? 'delivered' : ''}`}>
                                {order.shippingStatus}
                            </strong>
                        </div>
                    </div>
                </div>

                <aside className="order-detail-summary glass-morphism">
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                        <span>Order Date</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="summary-row">
                        <span>Payment Method</span>
                        <span>{order.paymentMethod}</span>
                    </div>

                    <div className="summary-row">
                        <span>Payment Status</span>
                        <span className={order.isPaid ? 'paid' : 'unpaid'}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                    </div>

                    <hr />

                    <div className="summary-row">
                        <span>Items Total</span>
                        <span>{formatPrice(order.itemsPrice)}</span>
                    </div>

                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>{formatPrice(order.shippingPrice)}</span>
                    </div>

                    <div className="summary-row total">
                        <span>Grand Total</span>
                        <span>{formatPrice(order.totalPrice)}</span>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default OrderDetail;
