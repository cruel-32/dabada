import { defineConfig } from 'drizzle-kit';

// Use DATABASE_URL if available, otherwise construct from individual env vars
const getDbCredentials = () => {
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'dabada',
    password: process.env.DB_PASSWORD || 'dabada_password',
    database: process.env.DB_NAME || 'dabada_db',
  };
};

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: getDbCredentials(),
});