const http = require('http');

const data = JSON.stringify({
  student_id: 'test_admin_user',
  session_id: 'test_session_123',
  candidates: Array.from({ length: 5 }).map((_, i) => ({
    program_id: `test_program_${i}`,
    features: {
      degree_match: 1,
      field_similarity: Math.random(),
      city_match: 1,
      fee_match: Math.random(),
      is_partner: true,
      has_active_deadline: true,
      program_popularity: 0.5,
      student_city_weight: 0.8,
      student_field_weight: 0.9,
      student_degree_weight: 1.0,
      student_fee_weight: 0.7,
      prior_clicks_on_field: 5,
      prior_clicks_on_city: 3,
      position_in_list: i
    }
  }))
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/score',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE:');
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', e => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
