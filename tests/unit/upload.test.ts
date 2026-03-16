import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '@/app';
import { generateAccessToken } from '@/utils/jwt';

// Mock cloudinary config
vi.mock('@/config/cloudinary', () => ({
  avatarUpload: {
    single: vi.fn(() => (req, res, next) => {
      // simulate multer putting a file on the request
      if (req.headers['simulate-no-file']) {
        next();
        return;
      }
      req.file = { buffer: Buffer.from('fake-image-data') };
      next();
    }),
  },
  uploadToCloudinary: vi.fn().mockResolvedValue('https://cloudinary.com/fake-url.png'),
}));

const MOCK_USER = {
  id: 'user-1',
  username: 'testuser',
};

describe('Upload Controller – /api/v1/upload', () => {
  let accessToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    accessToken = generateAccessToken({ userId: MOCK_USER.id, username: MOCK_USER.username });
  });

  describe('POST /api/v1/upload/avatar', () => {
    it('201 – uploads an avatar successfully', async () => {
      const res = await request(app)
        .post('/api/v1/upload/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('fake-image-data'), 'avatar.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toBe('https://cloudinary.com/fake-url.png');
    });

    it('400 – fails when no file is provided', async () => {
      const res = await request(app)
        .post('/api/v1/upload/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('simulate-no-file', 'true'); // trigger the mock to not provide a file

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('401 – returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/upload/avatar');
      expect(res.status).toBe(401);
    });
  });
});
