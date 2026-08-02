async function runTest() {
  try {
    const bookingId = '5e09c691-abaf-4ccf-99c6-b7e161712553';
    const statusRes = await fetch(`http://localhost:3004/status/${bookingId}`, {
      headers: { 'x-user-id': '1' }
    });
    const statusData = await statusRes.json();
    console.log(statusData);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runTest();
