"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const vitest_1 = require("vitest");
const mockModel = () => ({
    create: vitest_1.vi.fn(),
    createMany: vitest_1.vi.fn(),
    findUnique: vitest_1.vi.fn(),
    findFirst: vitest_1.vi.fn(),
    findMany: vitest_1.vi.fn(),
    update: vitest_1.vi.fn(),
    updateMany: vitest_1.vi.fn(),
    upsert: vitest_1.vi.fn(),
    delete: vitest_1.vi.fn(),
    deleteMany: vitest_1.vi.fn(),
    count: vitest_1.vi.fn(),
    groupBy: vitest_1.vi.fn(),
    aggregate: vitest_1.vi.fn(),
});
exports.prismaMock = {
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
    $connect: vitest_1.vi.fn(),
    $disconnect: vitest_1.vi.fn(),
    $transaction: vitest_1.vi.fn(),
};
exports.default = exports.prismaMock;
//# sourceMappingURL=prisma.js.map