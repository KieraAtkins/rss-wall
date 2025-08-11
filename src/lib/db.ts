import postgres from "postgres";

declare global {
	var __sql__: ReturnType<typeof postgres> | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.warn("DATABASE_URL is not set; database features will be disabled.");
}

export const sql: ReturnType<typeof postgres> | undefined =
	global.__sql__ ||
	(DATABASE_URL
		? postgres(DATABASE_URL, {
				ssl: "require",
			})
		: undefined);

if (process.env.NODE_ENV !== "production") {
	global.__sql__ = sql;
}

