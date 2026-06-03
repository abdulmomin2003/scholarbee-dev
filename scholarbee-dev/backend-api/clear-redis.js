const Redis = require('ioredis');
const redis = new Redis();
redis.flushdb().then(() => {
  console.log('Redis cleared');
  process.exit(0);
}).catch(console.error);
