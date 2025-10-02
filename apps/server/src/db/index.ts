import postgres from 'postgres'
import { type GeneratedAlways, Kysely } from 'kysely'
import { PostgresJSDialect } from 'kysely-postgres-js'

export const pg = postgres(process.env.DATABASE_URL || "");
interface Database {
    person: {
        id: GeneratedAlways<number>
        first_name: string | null
        last_name: string | null
        age: number
    }
}

// export const db = new Kysely<Database>({
//     dialect: new PostgresJSDialect({
//         postgres: pg,
//     }),
// })