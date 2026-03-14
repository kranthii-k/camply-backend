import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '@/app';
import prisma from '@/config/prisma';

// Mock passport middleare
vi.mock('passport', () => {
  const mockPassport = {
    use: vi.fn(),
    authenticate: vi.fn((strategy, options) => (req: any, res: any, next: any) => {
      if (req.headers['simulate-auth-failure']) {
        next();
        return;
      }
      req.user = { id: 'google-user-1', username: 'googler' };
      next();
    }),
    initialize: vi.fn(() => (req: any, res: any, next: any) => next()),
    session: vi.fn(() => (req: any, res: any, next: any) => next()),
  };
  return {
    default: mockPassport,
    ...mockPassport,
  };
});

vi.mock('@/config/prisma');

describe('Google Auth Controller – /api/v1/auth/google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/auth/google/callback', () => {
    it('302 – redirects to frontend with token on success', async () => {
      (prisma.refreshToken.findMany as any).mockResolvedValue([]);
      (prisma.refreshToken.create as any).mockResolvedValue({});

      const res = await request(app).get('/api/v1/auth/google/callback');

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('/auth/callback?token=');
      expect(res.headers['set-cookie']).toBeDefined(); // Refresh token cookie
    });

    it('401 – fails when passport does not provide user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/google/callback')
        .set('simulate-auth-failure', 'true');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Google authentication failed');
    });
  });
});
