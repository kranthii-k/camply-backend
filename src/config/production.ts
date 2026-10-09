type Environment = Record<string, string | undefined>;

const REQUIRED_PRODUCTION_VARIABLES = [
  "DATABASE_URL",
  "DIRECT_URL",
  "REDIS_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "SESSION_SECRET",
  "ALLOWED_ORIGINS",
  "FRONTEND_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const SECRET_VARIABLES = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "SESSION_SECRET",
] as const;

function parseHttpsUrl(name: string, value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute HTTPS URL`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS in production`);
  }

  return url;
}

export function assertProductionEnvironment(env: Environment = process.env): void {
  if (env.NODE_ENV !== "production") return;

  const missing = REQUIRED_PRODUCTION_VARIABLES.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }

  const weakSecrets = SECRET_VARIABLES.filter((name) => (env[name]?.length ?? 0) < 32);
  if (weakSecrets.length > 0) {
    throw new Error(`Production secrets must be at least 32 characters: ${weakSecrets.join(", ")}`);
  }

  if (new Set(SECRET_VARIABLES.map((name) => env[name])).size !== SECRET_VARIABLES.length) {
    throw new Error("JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, and SESSION_SECRET must be different values");
  }

  const frontendUrl = parseHttpsUrl("FRONTEND_URL", env.FRONTEND_URL!);
  const allowedOrigins = env.ALLOWED_ORIGINS!.split(",").map((origin) => origin.trim());
  for (const origin of allowedOrigins) {
    if (parseHttpsUrl("ALLOWED_ORIGINS entry", origin).origin !== origin) {
      throw new Error("ALLOWED_ORIGINS entries must contain only an HTTPS origin, without a path");
    }
  }
  if (!allowedOrigins.includes(frontendUrl.origin)) {
    throw new Error("ALLOWED_ORIGINS must include the origin configured in FRONTEND_URL");
  }

  const callbackUrl = parseHttpsUrl("GOOGLE_CALLBACK_URL", env.GOOGLE_CALLBACK_URL!);
  if (callbackUrl.pathname !== "/api/v1/auth/google/callback") {
    throw new Error("GOOGLE_CALLBACK_URL must use /api/v1/auth/google/callback");
  }
}