import { defineConfig } from 'drizzle-kit';
// import * as dotenv from 'dotenv';
// import path from 'path';

// // Load env from the root
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const { 
  POSTGRES_USER, 
  POSTGRES_PASSWORD, 
  POSTGRES_DB, 
  POSTGRES_HOST_PORT 
} = process.env;

const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_HOST_PORT}/${POSTGRES_DB}`;

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // This pulls the connection string from your .env file
    url: connectionString!,
  },
});