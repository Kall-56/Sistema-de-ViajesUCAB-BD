import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { openapi } from "@elysiajs/openapi";
import type { persona } from "shared";

const app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
    .use(openapi())
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405);
	})
	.get("/", () => "OK")
	.listen(3001, () => {
		console.log("Server is running on http://localhost:3001");
	});

