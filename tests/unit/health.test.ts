import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/config/prisma";
import { redisClient } from "../../src/config/redis";

describe("GET /health/ready", () => {
  beforeEach(() => {
    vi.spyOn(prisma, "$queryRaw").mockResolvedValue([] as never);
    Object.defineProperty(redisClient, "isReady", { configurable: true, value: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (redisClient as any).isReady;
  });

  it("returns 200 when PostgreSQL and Redis are ready", async () => {
    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      checks: { database: "ok", redis: "ok" },
    });
  });

  it("returns 503 when PostgreSQL is unavailable", async () => {
    vi.spyOn(prisma, "$queryRaw").mockRejectedValue(new Error("database unavailable"));

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.checks.database).toBe("unavailable");
  });

  it("returns 503 when Redis is unavailable", async () => {
    Object.defineProperty(redisClient, "isReady", { configurable: true, value: false });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.checks.redis).toBe("unavailable");
  });
});