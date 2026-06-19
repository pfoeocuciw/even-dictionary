import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'even_dictionary',
  user: process.env.PGUSER ?? process.env.USER,
  password: process.env.PGPASSWORD ?? '',
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
})
