const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const primaryKey = process.env.MTN_MOMO_PRIMARY_KEY;
const secondaryKey = process.env.MTN_MOMO_SECONDARY_KEY;
const baseUrl = 'https://sandbox.momodeveloper.mtn.com';

async function createApiUser(key) {
    console.log(`Attempting to create API User with key: ${key.substring(0, 5)}...`);
    const apiUser = uuidv4();
    await axios.post(
        `${baseUrl}/v1_0/apiuser`,
        { providerCallbackHost: 'localhost' },
        {
            headers: {
                'X-Reference-Id': apiUser,
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/json'
            }
        }
    );
    return apiUser;
}

async function generateApiKey(apiUser, key) {
    console.log('Generating API Key...');
    const response = await axios.post(
        `${baseUrl}/v1_0/apiuser/${apiUser}/apikey`,
        {},
        {
            headers: {
                'Ocp-Apim-Subscription-Key': key
            }
        }
    );
    return response.data.apiKey;
}

async function setupMomo() {
    let apiUser, apiKey, activeKey;

    try {
        if (!primaryKey && !secondaryKey) {
            console.error('MTN_MOMO keys missing in .env');
            return;
        }

        // Try Primary Key first
        try {
            activeKey = primaryKey;
            apiUser = await createApiUser(activeKey);
            apiKey = await generateApiKey(apiUser, activeKey);
        } catch (err) {
            console.warn('Primary Key failed, trying Secondary Key...');
            activeKey = secondaryKey;
            apiUser = await createApiUser(activeKey);
            apiKey = await generateApiKey(apiUser, activeKey);
        }

        console.log(`Success! API User: ${apiUser}, API Key: ${apiKey}`);

        // Update .env file
        const envPath = path.join(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        envContent = envContent.replace(/MTN_MOMO_API_USER=.*/, `MTN_MOMO_API_USER=${apiUser}`);
        envContent = envContent.replace(/MTN_MOMO_API_KEY=.*/, `MTN_MOMO_API_KEY=${apiKey}`);

        fs.writeFileSync(envPath, envContent);
        console.log('.env file updated with MoMo credentials.');

    } catch (error) {
        console.error('MoMo setup failed finally:', error.response?.data || error.message);
    }
}

setupMomo();
