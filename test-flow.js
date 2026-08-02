const axios = require('axios');

async function runTest() {
  try {
    console.log('1. Locking seats...');
    const lockRes = await axios.post('http://localhost:3004/lock-seats', {
      showtimeId: 'some-showtime',
      seatIds: ['A1'],
      totalAmount: 10
    }, {
      headers: { 'x-user-id': '1' }
    });
    
    const bookingId = lockRes.data.booking.id;
    console.log('Booking created:', bookingId);

    console.log('2. Processing payment...');
    const payRes = await axios.post('http://localhost:3005/process', {
      bookingId: bookingId,
      cardNumber: '1234',
      method: 'credit_card'
    });
    console.log('Payment response:', payRes.data);

    console.log('3. Polling for status...');
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await axios.get(`http://localhost:3004/status/${bookingId}`);
      console.log(`Status at attempt ${i}:`, statusRes.data.status);
      if (statusRes.data.status === 'CONFIRMED') {
        console.log('SUCCESS: Payment flow works.');
        return;
      }
    }
    console.log('FAILURE: Status never updated to CONFIRMED.');
  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

runTest();
