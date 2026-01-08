import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag, MessageSquare } from 'lucide-react';
import '../pages/AdminDashboard.css';

const AdminLayout = () => {
    const location = useLocation();

    return (
        <div className="admin-dashboard admin-fluid-container">
            <div className="dashboard-header">
                <h1>Admin Command Center</h1>
            </div>

            <div className="admin-content-layout">
                <aside className="admin-nav glass-morphism">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Store size={18} /> Overview
                    </NavLink>
                    <NavLink to="/admin/sellers" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Store size={18} /> Sellers
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Users size={18} /> Users
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Package size={18} /> Products
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
                        <ShoppingBag size={18} /> Orders
                    </NavLink>
                    <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                        <MessageSquare size={18} /> Reviews
                    </NavLink>
                </aside>

                <main className="admin-main glass-morphism">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
