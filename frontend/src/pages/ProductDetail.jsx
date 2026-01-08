import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [related, setRelated] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);

    // Review State
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, relRes, revRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/products/${id}`),
                    axios.get(`http://localhost:5000/api/products/${id}/related`),
                    axios.get(`http://localhost:5000/api/reviews/product/${id}`)
                ]);
                setProduct(prodRes.data.data);
                setRelated(relRes.data.data);
                setReviews(revRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!product) return <div className="not-found">Product not found</div>;

    const mainImgSrc = product.imageUrl
        ? (product.imageUrl.startsWith('/uploads') ? `http://localhost:5000${product.imageUrl}` : product.imageUrl)
        : 'https://via.placeholder.com/600';

    const handleAddToCart = async () => {
        // Guest Cart Logic
        if (!user) {
            const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            const existingItem = guestCart.find(item => item.product === product._id);

            if (existingItem) {
                existingItem.qty += qty;
                if (existingItem.qty > product.stock) existingItem.qty = product.stock;
            } else {
                guestCart.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl,
                    qty: qty,
                    stock: product.stock
                });
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            window.dispatchEvent(new Event('cartUpdated'));
            alert('Product added to your guest cart!');
            return;
        }

        if (user.role !== 'customer') {
            alert('Only customers can purchase products. Sellers and admins cannot add items to cart.');
            return;
        }

        setAddingToCart(true);
        try {
            await axios.post('http://localhost:5000/api/cart',
                { productId: product._id, qty },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert('Product added to cart!');
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review');
            navigate('/login');
            return;
        }
        setSubmittingReview(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/reviews',
                { productId: id, rating, comment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setReviews([data.data, ...reviews]);
            setShowReviewForm(false);
            setComment('');
            setRating(5);
            alert('Review submitted successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="product-detail-page container">
            <Link to="/" className="back-btn"><ArrowLeft size={18} /> Back to Shop</Link>

            <div className="product-main glass-morphism">
                <div className="product-gallery">
                    <img src={mainImgSrc} alt={product.name} />
                </div>

                <div className="product-content">
                    <span className="category-label">{product.category}</span>
                    <h1>{product.name}</h1>
                    <div className="product-rating">
                        <Star size={16} fill="var(--accent)" color="var(--accent)" />
                        <span>{product.averageRating?.toFixed(1) || '0.0'} ({reviews.length} reviews)</span>
                    </div>

                    <div className="product-price-section">
                        <span className="current-price">{formatPrice(product.price)}</span>
                        {product.stock > 0 ? (
                            <span className="stock-status in-stock">In Stock ({product.stock})</span>
                        ) : (
                            <span className="stock-status out-of-stock">Out of Stock</span>
                        )}
                    </div>

                    <p className="product-description">{product.description}</p>

                    <div className="seller-info-box glass-morphism">
                        <span>Sold by</span>
                        <h4>{product.storeName || 'Authorized Store'}</h4>
                    </div>

                    {product.stock > 0 && (
                        <div className="purchase-actions">
                            <div className="qty-selector">
                                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                            </div>
                            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart} disabled={addingToCart}>
                                <ShoppingCart size={20} /> {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                    )}

                    <div className="product-features">
                        <div className="feature">
                            <Truck size={20} />
                            <div>
                                <h5>Fast Delivery</h5>
                                <p>2-4 business days</p>
                            </div>
                        </div>
                        <div className="feature">
                            <ShieldCheck size={20} />
                            <div>
                                <h5>Secure Payment</h5>
                                <p>MoMo & Card accepted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="product-reviews-section">
                <div className="section-header">
                    <h2>Customer Reviews</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                </div>

                {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="review-form glass-morphism">
                        <h3>Write your review</h3>
                        <div className="form-group">
                            <label>Rating</label>
                            <div className="star-rating-select">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={24}
                                        onClick={() => setRating(star)}
                                        fill={star <= rating ? "var(--accent)" : "transparent"}
                                        color="var(--accent)"
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Comment</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                placeholder="Share your experience..."
                                rows="3"
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}
                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <p className="no-reviews">No reviews yet for this product.</p>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} className="review-card glass-morphism">
                                <div className="review-header">
                                    <div className="user-info">
                                        <Star size={14} fill="var(--accent)" color="var(--accent)" />
                                        <strong>{review.name}</strong>
                                    </div>
                                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="rating-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "var(--accent)" : "transparent"} color="var(--accent)" />
                                    ))}
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="related-products-section">
                <h2>Related Products</h2>
                <div className="product-grid">
                    {related.map(item => {
                        const relImgSrc = item.imageUrl
                            ? (item.imageUrl.startsWith('/uploads') ? `http://localhost:5000${item.imageUrl}` : item.imageUrl)
                            : 'https://via.placeholder.com/300';
                        return (
                            <Link key={item._id} to={`/product/${item._id}`} className="product-card glass-morphism">
                                <div className="product-image">
                                    <img src={relImgSrc} alt={item.name} />
                                </div>
                                <div className="product-info">
                                    <h3>{item.name}</h3>
                                    <span className="product-price">{formatPrice(item.price)}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default ProductDetail;
