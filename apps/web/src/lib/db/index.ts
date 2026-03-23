import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { webEnv } from "@kurvo/env/web";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
	if (!_db) {
		const client = postgres(
			webEnv.DATABASE_URL || "postgresql://localhost:5432/kurvo",
		);
		_db = drizzle(client, { schema });
	}

	return _db;
}

export const db = getDb();

export * from "./schema";
