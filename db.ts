import { Pool } from 'pg'

const pool = new Pool({
    user: "admin",
    password: "admin",
    host: 'localhost',
    port: 5432,
    database: 'admin'
})

export default pool