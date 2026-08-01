const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: '1' }, 'supersecret_access_key');
async function runTest() {
  try {
    const statusRes = await fetch('http://localhost:3000/api/bookings/status/123', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statusData = await statusRes.text();
    console.log('Gateway response:', statusData);
  } catch (err) {
    console.error('Test failed:', err);
  }
}
runTest();
