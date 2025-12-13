import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import { createUserService } from "./modules/user/user.service";
import { createUserDTO } from "./modules/user/user.dto";

new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.use(
		openapi({
            documentation: {
                info: {
                    title: 'Viajes UCAB API',
                    version: '0.5.0'
                }
            }
        }),
	)
	.post("/user",
		async ({ body, set }) => {
            try {
                const result = await createUserService(body);

                if (!result) {
                    set.status = 500;
                    return { error: "Ocurrió un error inesperado en el servidor." };
                }
                
                if (result.success) {
                    set.status = 201; // 201 Created: El recurso se creó correctamente.
                    return { message: "Usuario creado exitosamente", user: result.user };
                }

                // Si el servicio falla de forma controlada (ej. email duplicado).
                // 409 Conflict es ideal para recursos duplicados.
                set.status = result.message?.includes("ya está en uso") ? 409 : 400;
                return { error: result.message };

            } catch (error: any) {
                // Este bloque captura errores inesperados que no fueron manejados en el servicio.
                console.error("Error inesperado en el endpoint /user:", error);
                set.status = 500; // 500 Internal Server Error
                return { error: "Ocurrió un error inesperado en el servidor." };
            }
		},
		{
			body: createUserDTO, // Le decimos a Elysia y a OpenAPI cómo debe ser el body.
			detail: {
				summary: "Crea un nuevo usuario",
				tags: ["Usuario"], // Agrupa este endpoint bajo la etiqueta "Usuario".
			},
		},
	)
	.listen(3001, () => {
		console.log("Server is running on   http://localhost:3001");
        console.log("Access Openapi in      http://localhost:3001/openapi");
	});
