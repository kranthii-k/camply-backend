import { vi } from 'vitest';

const mockModel = () => ({
  create: vi.fn(),
  createMany: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  aggregate: vi.fn(),
});

export const prismaMock = {
  user: mockModel(),
  refreshToken: mockModel(),
  post: mockModel(),
  comment: mockModel(),
  vote: mockModel(),
  matchLike: mockModel(),
  team: mockModel(),
  teamMember: mockModel(),
  chat: mockModel(),
  chatMember: mockModel(),
  message: mockModel(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn(),
};

export default prismaMock;
