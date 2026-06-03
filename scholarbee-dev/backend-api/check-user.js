const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbee';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection('users').find({ email: 'abbasimomin0@gmail.com' }).toArray();
    console.log(users);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
