import { vi } from 'vitest';

process.env.JWT_ACCESS_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '5000';

vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue({
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    duplicate: vi.fn().mockReturnThis(),
    sendCommand: vi.fn().mockResolvedValue('OK'),
  }),
}));

vi.mock('rate-limit-redis', () => ({
  RedisStore: class MockRedisStore {
    constructor() {}
    init() {}
    async increment() { return { totalHits: 1, resetTime: new Date() }; }
    async decrement() {}
    async resetKey() {}
  },
}));

vi.mock('@socket.io/redis-adapter', () => ({
  createAdapter: vi.fn().mockReturnValue(vi.fn()),
}));
