import Redis from 'ioredis';

export const createRedisClient = (): Redis => {
	const client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
	client.on('error', (err) => console.error('Redis error', err));
	return client;
};
