import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import app from '@/app';
import prisma from '@/config/prisma';
import { generateAccessToken } from '@/utils/jwt';

vi.mock('@/config/prisma');

const MOCK_USER = {
  id: 'user-1',
  username: 'testuser',
};

const MOCK_CHAT = {
  id: 'chat-1',
  name: 'General',
  topic: 'Anything',
  createdAt: new Date(),
  _count: { members: 1, messages: 0 },
};

describe('Chat Controller – /api/v1/chats', () => {
  let accessToken: string;

  beforeAll(() => {
    accessToken = generateAccessToken({ userId: MOCK_USER.id, username: MOCK_USER.username });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/chats', () => {
    it('200 – returns list of chats', async () => {
      (prisma.chat.findMany as any).mockResolvedValue([MOCK_CHAT]);

      const res = await request(app)
        .get('/api/v1/chats')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chats).toHaveLength(1);
    });

    it('401 – returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/chats');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/chats', () => {
    it('201 – creates a new chat', async () => {
      (prisma.chat.create as any).mockResolvedValue(MOCK_CHAT);

      const res = await request(app)
        .post('/api/v1/chats')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'New Chat', topic: 'Testing' });

      expect(res.status).toBe(201);
      expect(res.body.data.chat.name).toBe(MOCK_CHAT.name);
    });

    it('400 – fails with missing name', async () => {
      const res = await request(app)
        .post('/api/v1/chats')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ topic: 'Testing' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/chats/:id/join', () => {
    it('200 – joins a chat', async () => {
      (prisma.chat.findUnique as any).mockResolvedValue(MOCK_CHAT);
      (prisma.chatMember.upsert as any).mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/chats/chat-1/join')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Joined chat');
    });

    it('404 – chat not found', async () => {
      (prisma.chat.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/chats/ghost/join')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/chats/:id/members/me', () => {
    it('200 – leaves a chat', async () => {
      (prisma.chatMember.findUnique as any).mockResolvedValue({ userId: MOCK_USER.id, chatId: 'chat-1' });
      (prisma.chatMember.delete as any).mockResolvedValue({});

      const res = await request(app)
        .delete('/api/v1/chats/chat-1/members/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Left chat successfully');
    });
  });
});
