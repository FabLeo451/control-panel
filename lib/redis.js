const Redis = require('ioredis');

let redis;

if (!global.redis) {
  let attempt = 0;
  const maxAttempts = 3;

  redis = new Redis({
    host: process.env.NEXT_PUBLIC_REDIS_HOST,
    port: process.env.NEXT_PUBLIC_REDIS_PORT,
    retryStrategy: (times) => {
      attempt++;
      if (attempt > maxAttempts) {
        console.error(`Redis: too many connection attempts (${times})`);
        return null;
      }
      return 1000;
    }
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('Redis is trying to connect...');
  });

  redis.on('ready', () => {
    console.log('Redis is connected and ready.');
  });

  redis.on('end', () => {
    console.warn('Redis connection closed.');
  });

  global.redis = redis;
  
} else {
  redis = global.redis;
}

module.exports = redis;
