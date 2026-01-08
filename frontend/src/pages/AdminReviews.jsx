import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import './AdminDashboard.css';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/reviews', config);
            setReviews(res.data.data);
        } catch (err) {
            console.error('Fetch Reviews Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const deleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        setActionLoading(id);
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchReviews();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loading">Loading Reviews...</div>;

    return (
        <div className="admin-view">
            <h2>Global Review Moderation</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>User</th>
                        <th>Review</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review._id}>
                            <td>{review.product?.name}</td>
                            <td>{review.user?.name}</td>
                            <td>
                                <div className="rating">{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</div>
                                <div className="comment-preview">{review.comment}</div>
                            </td>
                            <td>
                                <button className="block-btn" onClick={() => deleteReview(review._id)} title="Delete"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminReviews;
