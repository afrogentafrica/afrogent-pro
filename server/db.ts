import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// Initialize Neon client with the right parameters
const client = neon(process.env.DATABASE_URL!);

// Initialize Drizzle with the prepared SQL client and schema
export const db = drizzle(client, { schema });