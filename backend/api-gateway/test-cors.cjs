async function test() {
  const res = await fetch('http://localhost:3000/api/payments/process', {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST'
    }
  });
  console.log('Status:', res.status);
  console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
  console.log('Access-Control-Allow-Credentials:', res.headers.get('access-control-allow-credentials'));
}
test();
