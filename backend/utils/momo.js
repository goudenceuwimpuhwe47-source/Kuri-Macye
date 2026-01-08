const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class MomoUtility {
    constructor() {
        this.baseUrl = 'https://sandbox.momodeveloper.mtn.com';
        this.primaryKey = process.env.MTN_MOMO_PRIMARY_KEY;
        this.secondaryKey = process.env.MTN_MOMO_SECONDARY_KEY;
        this.apiUser = process.env.MTN_MOMO_API_USER;
        this.apiKey = process.env.MTN_MOMO_API_KEY;
        this.environment = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
    }

    /**
     * Get Client Access Token
     */
    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
            const response = await axios.post(
                `${this.baseUrl}/collection/token/`,
                {},
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.primaryKey,
                        'Authorization': `Basic ${auth}`
                    }
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Error getting MoMo access token:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Request To Pay
     */
    async requestToPay(amount, phoneNumber, externalId, payeeNote = 'Payment for order') {
        try {
            const token = await this.getAccessToken();
            const referenceId = uuidv4();

            const payload = {
                amount: amount.toString(),
                currency: 'RWF', // Rwanda currency
                externalId: externalId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phoneNumber
                },
                payerMessage: payeeNote,
                payeeNote: payeeNote
            };

            await axios.post(
                `${this.baseUrl}/collection/v1_0/requesttopay`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Reference-Id': referenceId,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return referenceId;
        } catch (error) {
            console.error('Error in MoMo requestToPay:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get Transaction Status
     */
    async getTransactionStatus(referenceId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error getting MoMo transaction status:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new MomoUtility();
