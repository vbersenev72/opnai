import { Pool } from 'pg'

const pool = new Pool({
    user: "admin",
    password: "admin",
    host: 'localhost',
    port: 5432,
    database: 'postgres'
})

export default pool