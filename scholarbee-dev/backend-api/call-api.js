const jwt = require('jsonwebtoken');

const secret = 'pJmC1rHndWgtefuw94usVhY6PMQoKacfa/RlZDFUZdZfr0y2eM9iMXSaqQVzCiK+VI9aweXNQfKIoGnUhmVzHQ=';
const token = jwt.sign({ userId: '6a1ca58b520cbc85dc51d387', email: 'abbasimomin0@gmail.com', user_type: 'Student' }, secret);

fetch('http://localhost:3010/api/recommendations?type=programs&limit=10&page=3', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(data => {
  console.log(data);
  process.exit(0);
}).catch(console.error);
