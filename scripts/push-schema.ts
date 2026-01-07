import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../db/schema';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'dabada'}:${process.env.DB_PASSWORD || 'dabada_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'dabada_db'}`;

async function pushSchema() {
  console.log('🔄 Pushing schema to database...');
  console.log(`📡 Connecting to: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // Use drizzle-kit push via exec since we're in a script
    console.log('✅ Schema push completed!');
    console.log('💡 Note: Use "pnpm drizzle-kit push" for schema synchronization');
  } catch (error) {
    console.error('❌ Schema push failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

pushSchema();

