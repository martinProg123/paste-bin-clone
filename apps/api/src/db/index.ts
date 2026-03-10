import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// Resolve the path to the root .env
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const { 
  POSTGRES_USER, 
  POSTGRES_PASSWORD, 
  POSTGRES_DB, 
  POSTGRES_HOST_PORT 
} = process.env;

const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_HOST_PORT}/${POSTGRES_DB}`;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });