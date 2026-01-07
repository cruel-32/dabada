import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'dabada'}:${process.env.DB_PASSWORD || 'dabada_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'dabada_db'}`;

async function testConnection() {
  try {
    const client = postgres(connectionString);
    const db = drizzle(client);

    console.log('🔌 Testing Drizzle connection to PostgreSQL...');
    console.log(`📡 Connection string: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);

    // Test basic query
    const result = await db.execute(sql`SELECT version(), current_database(), current_user`);
    
    console.log('✅ Connection successful!');
    console.log('📊 Database Info:');
    console.log(`   Version: ${result[0].version}`);
    console.log(`   Database: ${result[0].current_database}`);
    console.log(`   User: ${result[0].current_user}`);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();

