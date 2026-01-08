import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchCart = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCart(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            // Load guest cart
            const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            setCart({ cartItems: guestCart });
            setLoading(false);
        }

        const handleCartUpdate = () => {
            if (user) fetchCart();
            else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                setCart({ cartItems: guestCart });
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [user]);

    const updateQty = async (itemId, newQty) => {
        if (newQty < 1) return;

        if (!user) {
            // Update local cart
            const updatedCartItems = cart.cartItems.map(item => {
                if (item.product === itemId) { // Note: using product ID as identifier for guest cart
                    return { ...item, qty: Math.min(newQty, item.stock) };
                }
                return item;
            });
            setCart({ cartItems: updatedCartItems });
            localStorage.setItem('guestCart', JSON.stringify(updatedCartItems));
            window.dispatchEvent(new Event('cartUpdated'));
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/cart/${itemId}`, { qty: newQty }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            console.error(err);
        }
    };

    const removeItem = async (itemId) => {
        if (!user) {
            const updatedCartItems = cart.cartItems.filter(item => item.product !== itemId);
            setCart({ cartItems: updatedCartItems });
            localStorage.setItem('guestCart', JSON.stringify(updatedCartItems));
            window.dispatchEvent(new Event('cartUpdated'));
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            console.error(err);
        }
    };

    const calculateTotal = () => {
        return cart?.cartItems?.reduce((acc, item) => acc + (item.price * item.qty), 0) || 0;
    };

    if (loading) return <div className="loading">Loading cart...</div>;

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return (
            <div className="cart-empty container glass-morphism">
                <ShoppingBag size={80} color="var(--text-muted)" />
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart-page container">
            <h1>Shopping Cart</h1>
            <div className="cart-layout">
                <div className="cart-items-section">
                    {cart.cartItems.map(item => {
                        const imgSrc = item.image
                            ? (item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image)
                            : 'https://via.placeholder.com/100';
                        return (
                            <div key={item._id} className="cart-item glass-morphism">
                                <img src={imgSrc} alt={item.name} />
                                <div className="item-details">
                                    <Link to={`/product/${item.product}`}><h3>{item.name}</h3></Link>
                                    <span className="item-price">{formatPrice(item.price)}</span>
                                </div>
                                <div className="item-actions">
                                    <div className="qty-control">
                                        <button onClick={() => updateQty(user ? item._id : item.product, item.qty - 1)} disabled={item.qty <= 1}><Minus size={16} /></button>
                                        <span>{item.qty}</span>
                                        <button onClick={() => updateQty(user ? item._id : item.product, item.qty + 1)}><Plus size={16} /></button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeItem(user ? item._id : item.product)}><Trash2 size={20} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <aside className="cart-summary glass-morphism">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Items ({cart.cartItems.length})</span>
                        <span>{formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span className="free">FREE</span>
                    </div>
                    <div className="summary-total">
                        <span>Total</span>
                        <span>{formatPrice(calculateTotal())}</span>
                    </div>
                    {user ? (
                        <Link to="/checkout" className="btn btn-primary btn-block checkout-btn">
                            Proceed to Checkout <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <Link to="/login?redirect=checkout" className="btn btn-primary btn-block checkout-btn">
                            Login to Checkout <ArrowRight size={18} />
                        </Link>
                    )}
                    <div className="payment-icons">
                        {/* Payment icons placeholder */}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Cart;
