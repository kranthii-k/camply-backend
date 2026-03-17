import request from 'supertest';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/utils/jwt';

// Explicit prisma mock so prisma.user.update is a vi.fn()
vi.mock('../../src/config/prisma', () => ({
  default: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    post: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
    comment: { create: vi.fn() },
    vote: { groupBy: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('../../src/config/redis', () => ({
  getCached: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
  invalidateCache: vi.fn().mockResolvedValue(undefined),
  connectRedis: vi.fn().mockResolvedValue(undefined),
  redisClient: {
    sendCommand: vi.fn().mockImplementation(async (args: string[] = []) => {
      if (args[0] === 'SCRIPT' && args[1] === 'LOAD') return 'dummy-sha';
      if (args[0] === 'EVALSHA') return [1, 900];
      return 'OK';
    }),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  },
}));

vi.mock('../../src/services/notification.service', () => ({
  notifyComment: vi.fn(),
  notifyVote: vi.fn(),
  notifyTeamInvite: vi.fn(),
}));

vi.mock('../../src/services/trust.service', () => ({
  awardTrust: vi.fn().mockResolvedValue(undefined),
}));

// Import prisma AFTER mocking
import prisma from '../../src/config/prisma';

const VALID_PAYLOAD = {
  skills: ['Frontend', 'Backend'],
  hackathonsCount: '5+',
  bio: 'Building cool stuff with React and Node.js at hackathons.',
};

const MOCK_UPDATED_USER = {
  id: 'test-user-id',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  bio: VALID_PAYLOAD.bio,
  avatar: null,
  college: null,
  skills: VALID_PAYLOAD.skills,
  onboardingComplete: true,
  hackathonsCount: VALID_PAYLOAD.hackathonsCount,
  trustLevel: 'BRONZE',
  trustScore: 0,
  createdAt: new Date(),
  _count: { posts: 0, teamMembers: 0 },
};

describe('PATCH /api/v1/users/me/onboarding', () => {
  let token: string;

  beforeAll(() => {
    token = generateAccessToken({ userId: 'test-user-id', username: 'testuser' });
  });

  // ── Valid cases ─────────────────────────────────────────

  it('1. accepts valid payload with 2 skills → 200, onboardingComplete: true', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue(MOCK_UPDATED_USER as any);

    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.onboardingComplete).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledOnce();
  });

  it('2. accepts valid payload with 3 skills → 200', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...MOCK_UPDATED_USER,
      skills: ['Frontend', 'Backend', 'DevOps'],
    } as any);

    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, skills: ['Frontend', 'Backend', 'DevOps'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ── Invalid skills ───────────────────────────────────────

  it('3. rejects skills array with only 1 item → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, skills: ['Frontend'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('4. rejects skills array with 4 items → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, skills: ['Frontend', 'Backend', 'DevOps', 'Design'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('5. rejects skill containing an unapproved string → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, skills: ['Frontend', 'Blockchain'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ── Invalid hackathonsCount ──────────────────────────────

  it('6. rejects hackathonsCount "7+" (invalid value) → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, hackathonsCount: '7+' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ── Invalid bio ──────────────────────────────────────────

  it('7. rejects empty bio → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, bio: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('8. rejects bio that is 9 characters (too short) → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, bio: 'Short!!!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('9. rejects bio that is 301 characters (too long) → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, bio: 'a'.repeat(301) });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ── Unauthenticated ──────────────────────────────────────

  it('10. rejects unauthenticated request → 401', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/onboarding')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(401);
  });
});
