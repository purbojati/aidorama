import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as auth from "./schema/auth";
import * as characters from "./schema/characters";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
	schema: { ...auth, ...characters },
});

export { auth, characters };
