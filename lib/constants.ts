/**
 * Shared constants — single source of truth for magic numbers and config.
 * Import from here instead of scattering literals across files.
 */

// ── Session / Cookie ──────────────────────────────────────────────────────────

/** 30 days — how long the admin auth cookie stays valid (seconds). */
export const SESSION_MAX_AGE_SECS = 60 * 60 * 24 * 30;

/** 30 days in milliseconds — used for Date math in token validation. */
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECS * 1000;

// ── Rate Limiting ─────────────────────────────────────────────────────────────

/** Max failed login attempts before rate-limiting kicks in. */
export const RATE_LIMIT_MAX_ATTEMPTS = 5;

/** Window before the failed attempt counter resets (ms). */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// ── File Upload ───────────────────────────────────────────────────────────────

/** Max allowed upload size: 10 MB. */
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Allowed image MIME types for product photo uploads. */
export const UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// ── Integrations ──────────────────────────────────────────────────────────────

/** Google Sheets read cache window (ms). */
export const GOOGLE_SHEETS_CACHE_MS = 60 * 1000;
