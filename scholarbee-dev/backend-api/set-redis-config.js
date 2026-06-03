const Redis = require('ioredis');
const redis = new Redis();
redis.set('ml:config', JSON.stringify({
  service_url: 'http://127.0.0.1:5000',
  is_enabled: true,
  shadow_mode: true,
  timeout_ms: 2000,
  rollout_pct: 100
})).then(() => {
  console.log('Redis config set');
  process.exit(0);
}).catch(console.error);
