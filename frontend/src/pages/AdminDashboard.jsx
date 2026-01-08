import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, sellers: 0, products: 0, orders: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [usersRes, sellersRes, productsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/sellers/users', config),
                axios.get('http://localhost:5000/api/sellers', config),
                axios.get('http://localhost:5000/api/products/admin/all', config),
                axios.get('http://localhost:5000/api/orders', config)
            ]);

            const orders = ordersRes.data.data;
            const products = productsRes.data.data;

            setStats({
                users: usersRes.data.data.length,
                sellers: sellersRes.data.data.length,
                products: products.length,
                orders: orders.length
            });

            // Calculate Top Products
            const productSales = {};
            orders.forEach(order => {
                order.orderItems.forEach(item => {
                    if (productSales[item.product]) {
                        productSales[item.product].qty += item.qty;
                    } else {
                        // Find product details
                        const product = products.find(p => p._id === item.product);
                        productSales[item.product] = {
                            id: item.product,
                            name: item.name,
                            price: item.price,
                            qty: item.qty,
                            image: product ? product.imageUrl : 'no-image.jpg'
                        };
                    }
                });
            });

            const sortedProducts = Object.values(productSales)
                .sort((a, b) => b.qty - a.qty)
                .slice(0, 5);
            setTopProducts(sortedProducts);

            // Get Recent Orders
            const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
            setRecentOrders(sortedOrders);

        } catch (err) {
            console.error('Fetch Stats Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return <div className="loading">Loading Overview...</div>;

    return (
        <div className="admin-overview">
            <h2>System Overview</h2>
            <div className="admin-stats-grid">
                <NavLink to="/admin/users" className="admin-stat-card glass-morphism">
                    <Users size={24} color="#3b82f6" />
                    <div><span>Users</span><h3>{stats.users}</h3></div>
                </NavLink>
                <NavLink to="/admin/sellers" className="admin-stat-card glass-morphism">
                    <Store size={24} color="#f59e0b" />
                    <div><span>Sellers</span><h3>{stats.sellers}</h3></div>
                </NavLink>
                <NavLink to="/admin/products" className="admin-stat-card glass-morphism">
                    <Package size={24} color="#8b5cf6" />
                    <div><span>Products</span><h3>{stats.products}</h3></div>
                </NavLink>
                <NavLink to="/admin/orders" className="admin-stat-card glass-morphism">
                    <ShoppingBag size={24} color="#22c55e" />
                    <div><span>Orders</span><h3>{stats.orders}</h3></div>
                </NavLink>
            </div>

            <div className="dashboard-charts-grid">
                <div className="chart-card glass-morphism">
                    <h3>Top Selling Products</h3>
                    <table className="admin-table mini-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Sold</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map(p => (
                                <tr key={p.id}>
                                    <td className="product-cell-mini">
                                        <div className="product-info">
                                            <strong>{p.name}</strong>
                                        </div>
                                    </td>
                                    <td>{p.qty}</td>
                                    <td>{formatPrice(p.price * p.qty)}</td>
                                </tr>
                            ))}
                            {topProducts.length === 0 && <tr><td colSpan="3">No sales yet</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="chart-card glass-morphism">
                    <h3>Recent Orders</h3>
                    <table className="admin-table mini-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>{order.customer?.name || 'Guest'}</td>
                                    <td>{formatPrice(order.totalPrice)}</td>
                                    <td><span className={`status-pill ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && <tr><td colSpan="4">No orders yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
