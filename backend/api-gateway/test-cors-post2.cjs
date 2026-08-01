const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: '1' }, 'supersecret_access_key');
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/payments/process', {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId: '123' })
    });
    console.log('Status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Credentials:', res.headers.get('access-control-allow-credentials'));
    console.log('Body:', await res.text());
  } catch(err) {
    console.error(err);
  }
}
test();
