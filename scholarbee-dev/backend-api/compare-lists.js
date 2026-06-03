const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function main() {
  const uri = 'mongodb://localhost:27017/scholarbee';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('scholarbee');
    
    // Simulate recommendation requests by calling the API directly
    const http = require('http');

    const getRecs = (token) => {
      return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const req = http.request('http://localhost:3010/api/recommendations?type=programs&limit=10', {
          method: 'GET',
          headers
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve(JSON.parse(data).data);
          });
        });
        req.on('error', reject);
        req.end();
      });
    };

    // 1. Get anonymous recommendations
    const anonList = await getRecs(null);

    // 2. Get abbasimomin0@gmail.com recommendations
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: 'abbasimomin0@gmail.com' });
    const accessTokenPayload = {
      sub: user._id.toString(),
      userId: user._id.toString(),
      full_name: user.full_name,
      email: user.email,
      user_type: user.user_type,
    };
    const secret = process.env.LOGIN_JWT_SECRET;
    const token = jwt.sign(accessTokenPayload, secret, { expiresIn: '1d' });
    const authList = await getRecs(token);

    console.log('--- RECOMMENDATIONS COMPARISON ---');
    console.log(String('ANONYMOUS (TRENDING)').padEnd(50) + ' | ' + String('AUTHENTICATED (PERSONALIZED)').padEnd(50));
    console.log('-'.repeat(105));
    
    for (let i = 0; i < 10; i++) {
      const anonItem = anonList[i];
      const authItem = authList[i];
      const anonStr = anonItem ? `${anonItem.program_title} (${anonItem.location_details.city})` : 'N/A';
      const authStr = authItem ? `${authItem.program_title} (${authItem.location_details.city}) - score: ${authItem.relevance_score || 'N/A'}` : 'N/A';
      console.log(anonStr.substring(0, 48).padEnd(50) + ' | ' + authStr.substring(0, 50).padEnd(50));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
