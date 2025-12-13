import sql from '../../db'
import type { Static } from '@sinclair/typebox'
import type { createUserDTO } from './user.dto'

type UserPayload = Static<typeof createUserDTO>

export async function createUserService(userData: UserPayload) {
    const { email, password, idRol, idCliente, idProveedor } = userData

    try {
        // Usamos sql`` para ejecutar una consulta.
        // Postgres.js se encarga de sanitizar los parámetros para prevenir SQL Injection.
        // Al usar CALL con un parámetro INOUT, postgres.js devuelve el valor de salida.
        const result = await sql`
            CALL insertar_usuario(${email}, ${password}, ${idRol}, ${idCliente ?? null}, ${idProveedor ?? null}, null)
        `
        // El resultado será un array con un objeto, ej: [{ idusuario: 123 }]
        // Nota: El nombre de la propiedad suele estar en minúsculas.
        const newUserId = result[0]?.id_usuario;

        if (newUserId) {
            return {
                success: true,
                user: { id: newUserId, email, idRol, idCliente, idProveedor },
            }
        }

    } catch (error: any) {
        // Manejo de errores, por ejemplo, si el email ya existe (violación de constraint UNIQUE)
        console.error("Error en createUserService:", error);

        // Si el error es por un email duplicado, devolvemos un mensaje específico.
        if (error.code === "23505") {
            return { success: false, message: "El correo electrónico ya está en uso." };
        }

        // Para cualquier otro error, devolvemos el mensaje del error.
        return { success: false, message: error.message || "Ocurrió un error inesperado." };
    }
}
