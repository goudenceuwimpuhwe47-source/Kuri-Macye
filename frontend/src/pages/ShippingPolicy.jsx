import React from 'react';
import { formatPrice } from '../utils/formatPrice';
import './PolicyPages.css';

const ShippingPolicy = () => {
    return (
        <div className="policy-page container">
            <div className="policy-container glass-morphism">
                <div className="policy-header">
                    <h1>Shipping Policy</h1>
                    <p>Everything you need to know about your product delivery.</p>
                </div>

                <div className="policy-content">
                    <section>
                        <h2>Processing Time</h2>
                        <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
                        <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.</p>
                    </section>

                    <section>
                        <h2>Shipping Rates & Delivery Estimates</h2>
                        <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
                        <ul>
                            <li><strong>Standard Shipping:</strong> 3-5 business days - {formatPrice(2000)}</li>
                            <li><strong>Express Shipping:</strong> 1-2 business days - {formatPrice(5000)}</li>
                            <li><strong>Free Shipping:</strong> On orders over {formatPrice(50000)}</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Shipment Confirmation & Order Tracking</h2>
                        <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
                    </section>

                    <section>
                        <h2>Customs, Duties and Taxes</h2>
                        <p>Kuri-Macye is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).</p>
                    </section>
                </div>

                <div className="last-updated">
                    Last Updated: January 2026
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
