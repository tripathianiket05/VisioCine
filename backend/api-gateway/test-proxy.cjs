const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: '1' }, 'supersecret_access_key');
async function runTest() {
  try {
    const payRes = await fetch('http://localhost:3000/api/payments/process', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: '123',
        cardNumber: '1234',
        method: 'credit_card'
      }),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const payData = await payRes.text();
    console.log('Gateway response:', payData);
  } catch (err) {
    console.error('Test failed:', err);
  }
}
runTest();
