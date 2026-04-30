/**
 * Validated environment variable accessors.
 *
 * In production, missing required vars throw immediately so the deployment
 * fails loudly rather than falling back to insecure defaults.
 * In development, safe defaults are used so the app starts without a full
 * .env.local setup.
 */

function requireEnv(key: string, devDefault: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[env] Missing required environment variable: ${key}. ` +
          `Set it in your Vercel project settings before deploying.`
      );
    }
    return devDefault;
  }
  return value;
}

export function getAdminPassword(): string {
  return requireEnv("ADMIN_PASSWORD", "admin");
}

export function getSessionSecret(): string {
  return requireEnv("SESSION_SECRET", "dev-secret-urban-supply");
}

/**
 * SESSION_EPOCH is an integer you can increment in Vercel env vars to
 * immediately invalidate all existing sessions without changing the password.
 * Defaults to "1" — bump it to "2", "3", etc. to force re-login for all users.
 */
export function getSessionEpoch(): string {
  return process.env.SESSION_EPOCH ?? "1";
}

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}
