/** Run catalog DB work; return fallback when Postgres is missing or unreachable. */
export async function safeCatalogQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL?.trim()) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
