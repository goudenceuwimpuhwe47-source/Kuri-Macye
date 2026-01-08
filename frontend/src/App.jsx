import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import SellerDashboard from './pages/SellerDashboard';
import SellerSetup from './pages/SellerSetup';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './components/AdminLayout';
import AdminSellers from './pages/AdminSellers';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminReviews from './pages/AdminReviews';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnRefund from './pages/ReturnRefund';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

if (!stripeKey) {
    console.error('Stripe Publishable Key is missing! Make sure is set in .env');
}

const Layout = ({ children }) => {
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');

    return (
        <div className="app">
            <Header />
            <main>
                {children}
            </main>
            {!isDashboard && <Footer />}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Elements stripe={stripePromise}>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/order/:id" element={<OrderDetail />} />
                            <Route path="/shipping-policy" element={<ShippingPolicy />} />
                            <Route path="/return-refund" element={<ReturnRefund />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                            {/* Protected Dashboard Routes */}
                            <Route path="/seller/dashboard" element={
                                <ProtectedRoute role="seller">
                                    <SellerDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/seller-setup" element={
                                <ProtectedRoute>
                                    <SellerSetup />
                                </ProtectedRoute>
                            } />

                            {/* Admin Routes */}
                            <Route path="/admin" element={
                                <ProtectedRoute role="admin">
                                    <AdminLayout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="sellers" element={<AdminSellers />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="products" element={<AdminProducts />} />
                                <Route path="orders" element={<AdminOrders />} />
                                <Route path="reviews" element={<AdminReviews />} />
                            </Route>
                        </Routes>
                    </Layout>
                </Router>
            </Elements>
        </AuthProvider>
    );
}

export default App;

