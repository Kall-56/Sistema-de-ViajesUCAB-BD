import { t } from 'elysia'

export const createUserDTO = t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 8 }),
    idRol: t.Number(),
    idCliente: t.Optional(t.Nullable(t.Number())),
    idProveedor: t.Optional(t.Nullable(t.Number())),
})
