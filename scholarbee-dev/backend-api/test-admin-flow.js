const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const secret = 'pJmC1rHndWgtefuw94usVhY6PMQoKacfa/RlZDFUZdZfr0y2eM9iMXSaqQVzCiK+VI9aweXNQfKIoGnUhmVzHQ=';

// Create a valid Super_Admin token
const token = jwt.sign({
  user_id: '60d5ecb8b392d73000000001', // Dummy admin ID
  email: 'admin@scholarbee.com',
  user_type: 'Super_Admin'
}, secret, { expiresIn: '1h' });

async function test() {
  console.log('Testing ML Status API...');
  let res = await fetch('http://localhost:3010/api/admin/ml/status', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  let data = await res.json();
  console.log('Status Response:', data);

  console.log('\nTesting ML Train API...');
  res = await fetch('http://localhost:3010/api/admin/ml/train', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ force: true })
  });
  data = await res.json();
  console.log('Train Response:', data);

  console.log('\nTesting ML Test API...');
  res = await fetch('http://localhost:3010/api/admin/ml/test', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  console.log('Test Response:', data);
}

test().catch(console.error);
