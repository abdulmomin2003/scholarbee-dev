const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbee';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('users').updateOne(
      { email: 'abbasimomin0@gmail.com' },
      { $set: { user_type: 'Super_Admin' } }
    );
    console.log(`Matched ${result.matchedCount}, Modified ${result.modifiedCount}`);
    
    // Check it
    const u = await db.collection('users').findOne({ email: 'abbasimomin0@gmail.com' });
    console.log(u);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
