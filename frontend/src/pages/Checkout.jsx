import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { formatPrice } from '../utils/formatPrice';
import './Checkout.css';

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        city: '',
        addressLine: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('MoMo');
    const [momoNumber, setMomoNumber] = useState('');

    useEffect(() => {
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
        if (user) fetchCart();
        else setLoading(false);
    }, [user]);

    const stripe = useStripe();
    const elements = useElements();

    const placeOrder = async (e) => {
        e.preventDefault();
        setProcessing(true);

        // Validation for Stripe
        if (paymentMethod === 'Stripe' && (!stripe || !elements)) {
            setProcessing(false);
            return;
        }

        try {
            let paymentResultStr = null;

            if (paymentMethod === 'Stripe') {
                const cardElement = elements.getElement(CardElement);
                const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                });

                if (error) {
                    alert(error.message);
                    setProcessing(false);
                    return;
                }
                paymentResultStr = stripePaymentMethod.id;
            }

            // Transform cart items to order items format
            const orderItems = cart.cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.image,
                price: item.price,
                product: item.product,
                seller: item.seller
            }));

            const orderData = {
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice: calculateItemsPrice(),
                shippingPrice: 0,
                totalPrice: calculateItemsPrice()
            };

            const { data } = await axios.post('http://localhost:5000/api/orders', orderData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Handle Payment Simulation
            if (paymentMethod === 'MoMo') {
                try {
                    await axios.post('http://localhost:5000/api/payments/momo', {
                        orderId: data.data._id,
                        phoneNumber: momoNumber
                    }, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                } catch (payErr) {
                    console.error('Payment processing:', payErr);
                }
            } else if (paymentMethod === 'Stripe') {
                try {
                    await axios.post('http://localhost:5000/api/payments/stripe', {
                        orderId: data.data._id,
                        paymentId: paymentResultStr
                    }, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                } catch (payErr) {
                    console.error('Payment processing:', payErr);
                }
            }

            alert('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Order placement failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const calculateItemsPrice = () => {
        return cart?.cartItems?.reduce((acc, item) => acc + (item.price * item.qty), 0) || 0;
    };

    if (loading) return <div className="loading">Preparing checkout...</div>;

    if (!user) {
        return (
            <div className="checkout-page container">
                <div className="glass-morphism" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h2>Please login to checkout</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
                </div>
            </div>
        );
    }

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return (
            <div className="checkout-page container">
                <div className="glass-morphism" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h2>Your cart is empty</h2>
                    <p>Add some products before checking out.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/shop')}>Go Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page container">
            <h1>Checkout</h1>
            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={placeOrder}>
                    <div className="checkout-section glass-morphism">
                        <h3><Truck size={20} /> Shipping Address</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={shippingAddress.fullName}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address Line</label>
                                <input
                                    type="text"
                                    value={shippingAddress.addressLine}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="checkout-section glass-morphism">
                        <h3><CreditCard size={20} /> Payment Method</h3>
                        <div className="payment-options">
                            <div
                                className={`payment-option ${paymentMethod === 'MoMo' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('MoMo')}
                            >
                                <h4>MTN MoMo</h4>
                                <p>Fast & Secure mobile payment</p>
                            </div>
                            <div
                                className={`payment-option ${paymentMethod === 'Stripe' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('Stripe')}
                            >
                                <h4>Stripe / Card</h4>
                                <p>Pay with credit or debit card</p>
                            </div>
                        </div>

                        {paymentMethod === 'MoMo' && (
                            <div className="momo-input-group">
                                <label>MTN Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="078XXXXXXX"
                                    value={momoNumber}
                                    onChange={(e) => setMomoNumber(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {paymentMethod === 'Stripe' && (
                            <div className="stripe-input-group">
                                <label>Card Details</label>
                                <div className="card-element-container">
                                    <CardElement options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#ffffff',
                                                '::placeholder': {
                                                    color: '#aab7c4',
                                                },
                                            },
                                            invalid: {
                                                color: '#fa755a',
                                                iconColor: '#fa755a',
                                            },
                                        },
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary btn-block place-order-btn" disabled={processing}>
                        {processing ? <Loader className="animate-spin" size={20} /> : 'Complete Order'}
                    </button>
                </form>

                <aside className="checkout-summary glass-morphism">
                    <h3>Order Items</h3>
                    <div className="summary-items">
                        {cart.cartItems.map(item => (
                            <div key={item._id} className="summary-item">
                                <div className="item-info">
                                    <span className="qty">{item.qty}x</span>
                                    <span className="name">{item.name}</span>
                                </div>
                                <span className="price">{formatPrice(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-totals">
                        <div className="row">
                            <span>Subtotal</span>
                            <span>{formatPrice(calculateItemsPrice())}</span>
                        </div>
                        <div className="row">
                            <span>Shipping</span>
                            <span>{formatPrice(0)}</span>
                        </div>
                        <div className="row total">
                            <span>Grand Total</span>
                            <span>{formatPrice(calculateItemsPrice())}</span>
                        </div>
                    </div>
                    <div className="secure-badge">
                        <ShieldCheck size={18} />
                        Secure Encrypted Checkout
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Checkout;
