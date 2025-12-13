import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
    // Para producción, podrías necesitar configurar SSL:
    // ssl: 'require'
})
export default sql
