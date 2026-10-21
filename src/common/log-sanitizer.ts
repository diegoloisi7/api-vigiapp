const SENSITIVE_KEY =
  /^(password|passwordhash|password_hash|email|dni|address|firstname|lastname|homelatitude|homelongitude|authorization|token|accesstoken|access_token|refreshtoken|refresh_token|jwt|secret|endpoint|auth_key|p256dh_key)$/i;

const MAX_DEPTH = 8;
const MAX_PROPERTIES = 50;
const MAX_ARRAY_ITEMS = 50;
const MAX_STRING_LENGTH = 500;
const MAX_LOG_LENGTH = 8_000;

export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[profundidad omitida]';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…[truncado]`
      : value;
  }
  if (Array.isArray(value)) {
    const items = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeForLog(item, depth + 1));
    if (value.length > MAX_ARRAY_ITEMS) items.push('[elementos omitidos]');
    return items;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, MAX_PROPERTIES)
        .map(([key, nested]) => [
          key,
          SENSITIVE_KEY.test(key)
            ? '[oculto]'
            : sanitizeForLog(nested, depth + 1),
        ]),
    );
  }
  return value;
}

export function formatLogEntry(entry: unknown): string {
  let serialized: string;
  try {
    serialized = JSON.stringify(sanitizeForLog(entry));
  } catch {
    return '{"event":"http","message":"No se pudo serializar el registro"}';
  }

  if (serialized.length <= MAX_LOG_LENGTH) return serialized;
  return JSON.stringify({
    truncated: true,
    preview: `${serialized.slice(0, MAX_LOG_LENGTH - 40)}…[registro truncado]`,
  });
}
