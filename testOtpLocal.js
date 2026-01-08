const generateOtp = require('./backend/utils/otp');

function testOtp() {
    console.log('Testing OTP Generation...');
    const otp = generateOtp();
    console.log('Generated OTP:', otp);

    const now = Date.now();
    const isExpired = otp.expireAt < now;
    const expiresInMinutes = (otp.expireAt - now) / 1000 / 60;

    console.log('Current Time:', new Date(now).toISOString());
    console.log('Expiry Time: ', new Date(otp.expireAt).toISOString());
    console.log('Expires in:', expiresInMinutes.toFixed(2), 'minutes');
    console.log('Is valid length (6 digits):', otp.code.length === 6);
    console.log('Is valid format (numeric):', /^\d+$/.test(otp.code));
    console.log('Functional Check:', !isExpired && otp.code.length === 6 ? 'PASSED' : 'FAILED');
}

testOtp();
