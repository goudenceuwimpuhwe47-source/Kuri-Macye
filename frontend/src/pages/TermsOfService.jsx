import React from 'react';
import './PolicyPages.css';

const TermsOfService = () => {
    return (
        <div className="policy-page container">
            <div className="policy-container glass-morphism">
                <div className="policy-header">
                    <h1>Terms of Service</h1>
                    <p>Please read these terms carefully before using our service.</p>
                </div>

                <div className="policy-content">
                    <section>
                        <h2>Acceptance of Terms</h2>
                        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section>
                        <h2>Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Kuri-Macye's website for personal, non-commercial transitory viewing only.</p>
                    </section>

                    <section>
                        <h2>Disclaimer</h2>
                        <p>The materials on Kuri-Macye's website are provided on an 'as is' basis. Kuri-Macye makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    </section>

                    <section>
                        <h2>Limitations</h2>
                        <p>In no event shall Kuri-Macye or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Kuri-Macye's website.</p>
                    </section>
                </div>

                <div className="last-updated">
                    Last Updated: January 2026
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
