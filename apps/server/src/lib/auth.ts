import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {pg} from "../db";
import * as schema from "../db/schema/auth";
import {PostgresJSDialect} from "kysely-postgres-js";

export const auth = betterAuth<BetterAuthOptions>({
	database: new PostgresJSDialect({
        postgres: pg,
    }),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
