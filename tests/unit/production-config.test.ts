import { describe, expect, it } from "vitest";
import { assertProductionEnvironment } from "../../src/config/production";

const validProductionEnvironment = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:password@db.example.com/camply",
  DIRECT_URL: "postgresql://user:password@db.example.com/camply",
  REDIS_URL: "rediss://:password@redis.example.com:6379",
  JWT_ACCESS_SECRET: "a".repeat(48),
  JWT_REFRESH_SECRET: "b".repeat(48),
  SESSION_SECRET: "c".repeat(48),
  ALLOWED_ORIGINS: "https://camplyy.in,https://www.camplyy.in",
  FRONTEND_URL: "https://camplyy.in",
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  GOOGLE_CALLBACK_URL: "https://api.camplyy.in/api/v1/auth/google/callback",
  CLOUDINARY_CLOUD_NAME: "camply",
  CLOUDINARY_API_KEY: "cloudinary-key",
  CLOUDINARY_API_SECRET: "cloudinary-secret",
};

describe("assertProductionEnvironment", () => {
  it("accepts a complete production configuration", () => {
    expect(() => assertProductionEnvironment(validProductionEnvironment)).not.toThrow();
  });

  it("does not enforce production-only settings outside production", () => {
    expect(() => assertProductionEnvironment({ NODE_ENV: "test" })).not.toThrow();
  });

  it("lists missing settings without exposing secret values", () => {
    expect(() => assertProductionEnvironment({ NODE_ENV: "production" })).toThrow(
      "Missing production environment variables: DATABASE_URL, DIRECT_URL"
    );
  });

  it("rejects short or reused secrets", () => {
    expect(() => assertProductionEnvironment({
      ...validProductionEnvironment,
      SESSION_SECRET: "short",
    })).toThrow("Production secrets must be at least 32 characters");

    expect(() => assertProductionEnvironment({
      ...validProductionEnvironment,
      SESSION_SECRET: validProductionEnvironment.JWT_ACCESS_SECRET,
    })).toThrow("must be different values");
  });

  it("requires the frontend origin and Google callback to use the expected HTTPS URLs", () => {
    expect(() => assertProductionEnvironment({
      ...validProductionEnvironment,
      ALLOWED_ORIGINS: "https://www.camplyy.in",
    })).toThrow("ALLOWED_ORIGINS must include the origin configured in FRONTEND_URL");

    expect(() => assertProductionEnvironment({
      ...validProductionEnvironment,
      GOOGLE_CALLBACK_URL: "https://api.camplyy.in/incorrect-path",
    })).toThrow("GOOGLE_CALLBACK_URL must use /api/v1/auth/google/callback");
  });
});