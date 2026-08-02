async function runTest() {
  try {
    console.log('1. Locking seats...');
    const lockRes = await fetch('http://localhost:3004/lock-seats', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'some-showtime',
        seatIds: ['A1'],
        totalAmount: 10
      }),
      headers: { 'x-user-id': '1', 'Content-Type': 'application/json' }
    });
    
    const lockData = await lockRes.json();
    if (!lockRes.ok) throw new Error(lockData.error || 'Lock failed');
    
    const bookingId = lockData.booking.id;
    console.log('Booking created:', bookingId);

    console.log('2. Processing payment...');
    const payRes = await fetch('http://localhost:3005/process', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: bookingId,
        cardNumber: '1234',
        method: 'credit_card'
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const payData = await payRes.json();
    console.log('Payment response:', payData);

    console.log('3. Polling for status...');
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`http://localhost:3004/status/${bookingId}`);
      const statusData = await statusRes.json();
      console.log(`Status at attempt ${i}:`, statusData.status);
      if (statusData.status === 'CONFIRMED') {
        console.log('SUCCESS: Payment flow works.');
        return;
      }
    }
    console.log('FAILURE: Status never updated to CONFIRMED.');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runTest();
