/*
 * Whether Prisma has somewhere to connect. Without DATABASE_URL the app still
 * runs, from what is on disk and in memory: the catalogue routes serve
 * prisma/seed-data.mjs (lib/catalogue/list.ts), the news and story routes keep
 * their rows in memory for the life of the process (lib/news/memory.ts,
 * app/api/stories). Nothing here ever touches the database itself, so it is
 * safe to import from anywhere on the server.
 */
export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}
