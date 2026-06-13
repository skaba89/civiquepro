/**
 * Server-side input sanitization utilities.
 * Strips HTML/JS tags and normalizes whitespace to prevent stored XSS.
 */

/**
 * Check if a string contains HTML tags — if so, it should be REJECTED, not sanitized.
 * This prevents confusing UX where "<script>alert(1)</script>" becomes "alert(1)" stored in DB.
 */
function containsHtmlTags(input: string): boolean {
  return /<[^>]*>/.test(input);
}

/**
 * Strip all HTML tags and encode dangerous characters from a string.
 * Prevents stored XSS by ensuring no HTML/JS can be injected via text fields.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')           // Remove all HTML tags
    .replace(/&/g, '&amp;')            // Encode ampersands
    .replace(/</g, '&lt;')             // Encode less-than
    .replace(/>/g, '&gt;')             // Encode greater-than
    .replace(/"/g, '&quot;')           // Encode double quotes
    .replace(/'/g, '&#x27;')           // Encode single quotes
    .replace(/\s+/g, ' ')              // Normalize whitespace
    .trim();
}

/**
 * Validate and sanitize a name field.
 * REJECTS input containing HTML tags (returns null).
 * Returns null if invalid, sanitized string if valid.
 */
export function sanitizeName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  // REJECT any input containing HTML tags — don't try to sanitize malicious input
  if (containsHtmlTags(name)) return null;
  const sanitized = sanitizeText(name);
  if (!sanitized || sanitized.length === 0) return null;
  if (sanitized.length > 100) return null;  // Max 100 chars
  return sanitized;
}

/**
 * Validate and sanitize an email field.
 * Returns null if invalid, normalized string if valid.
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) return null;  // RFC 5321 limit
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return null;
  return trimmed;
}

/**
 * Safely parse JSON from a request, returning null on failure.
 * This prevents 500 errors from malformed JSON.
 */
export async function safeParseJSON(request: Request): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  try {
    const text = await request.text();
    if (!text || text.trim().length === 0) {
      return { data: null, error: 'Corps de la requête vide' };
    }
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { data: null, error: 'Format JSON invalide' };
    }
    return { data: parsed, error: null };
  } catch {
    return { data: null, error: 'JSON malformé' };
  }
}
