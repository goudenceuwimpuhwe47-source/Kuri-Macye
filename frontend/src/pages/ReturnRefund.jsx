import React from 'react';
import './PolicyPages.css';

const ReturnRefund = () => {
    return (
        <div className="policy-page container">
            <div className="policy-container glass-morphism">
                <div className="policy-header">
                    <h1>Return & Refund Policy</h1>
                    <p>We want you to be completely satisfied with your purchase.</p>
                </div>

                <div className="policy-content">
                    <section>
                        <h2>Returns</h2>
                        <p>You have 30 calendar days to return an item from the date you received it.</p>
                        <p>To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>
                    </section>

                    <section>
                        <h2>Refunds</h2>
                        <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
                        <p>If your return is approved, we will initiate a refund to your original method of payment (Mobile Money or Credit Card).</p>
                    </section>

                    <section>
                        <h2>Shipping</h2>
                        <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
                        <p>If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
                    </section>

                    <section>
                        <h2>Contact Us</h2>
                        <p>If you have any questions on how to return your item to us, contact us at returns@kuri-macye.com.</p>
                    </section>
                </div>

                <div className="last-updated">
                    Last Updated: January 2026
                </div>
            </div>
        </div>
    );
};

export default ReturnRefund;
