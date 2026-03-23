import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { webEnv } from "@kurvo/env/web";

// Load the right env file based on environment
if (webEnv.NODE_ENV === "production") {
	dotenv.config({ path: ".env.production" });
} else {
	dotenv.config({ path: ".env.local" });
}

export default {
	schema: "./src/schema.ts",
	dialect: "postgresql",
	migrations: {
		table: "drizzle_migrations",
	},
	dbCredentials: {
		url: webEnv.DATABASE_URL || "postgresql://localhost:5432/kurvo",
	},
	out: "./migrations",
	strict: webEnv.NODE_ENV === "production",
} satisfies Config;
