import React from 'react';
import './PolicyPages.css';

const PrivacyPolicy = () => {
    return (
        <div className="policy-page container">
            <div className="policy-container glass-morphism">
                <div className="policy-header">
                    <h1>Privacy Policy</h1>
                    <p>We value your privacy and are committed to protecting your personal data.</p>
                </div>

                <div className="policy-content">
                    <section>
                        <h2>Information Collection</h2>
                        <p>We collect information that you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us.</p>
                    </section>

                    <section>
                        <h2>Use of Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to process transactions, send you related information, and respond to your comments and questions.</p>
                    </section>

                    <section>
                        <h2>Data Security</h2>
                        <p>We implement reasonable security measures to help protect your personal information and prevent unauthorized access, disclosure, or destruction.</p>
                    </section>

                    <section>
                        <h2>Cookies</h2>
                        <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>
                    </section>
                </div>

                <div className="last-updated">
                    Last Updated: January 2026
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
