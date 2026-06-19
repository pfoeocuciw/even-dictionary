import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORDS_PATH = process.env.WORDS_FILE ?? resolve(__dirname, '../../words_llm.json')

function normalizeForms(forms) {
  if (!forms?.length) return []
  return forms.map((f) => ({
    name: f.label ?? f.case ?? f.name ?? '',
    sg: f.form ?? f.sg ?? '',
    pl: f.pl ?? null,
  }))
}

async function seed() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS words (
        id        SERIAL PRIMARY KEY,
        word      TEXT NOT NULL DEFAULT '',
        ipa       TEXT NOT NULL DEFAULT '',
        pos       TEXT NOT NULL DEFAULT '',
        translation TEXT NOT NULL DEFAULT '',
        alt       TEXT NOT NULL DEFAULT '',
        tags      JSONB NOT NULL DEFAULT '[]',
        examples  JSONB NOT NULL DEFAULT '[]',
        forms     JSONB NOT NULL DEFAULT '[]'
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS words_word_trgm
        ON words USING gin(word gin_trgm_ops)
    `).catch(() => {
      // pg_trgm might not be available — fall back without it
    })

    const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM words')
    if (rows[0].n > 0) {
      console.log(`Таблица уже содержит ${rows[0].n} слов — пропускаем seed.`)
      return
    }

    console.log('Читаем JSON…')
    const raw = JSON.parse(readFileSync(WORDS_PATH, 'utf-8'))

    console.log(`Импортируем ${raw.length} слов…`)
    const BATCH = 500
    for (let i = 0; i < raw.length; i += BATCH) {
      const slice = raw.slice(i, i + BATCH)
      const values = []
      const params = []
      let p = 1
      for (const entry of slice) {
        values.push(
          `($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`
        )
        params.push(
          entry.word ?? '',
          entry.ipa ?? '',
          entry.pos ?? '',
          entry.translation ?? '',
          entry.alt ?? '',
          JSON.stringify(entry.tags ?? []),
          JSON.stringify(entry.examples ?? []),
          JSON.stringify(normalizeForms(entry.forms)),
        )
      }
      await client.query(
        `INSERT INTO words (word,ipa,pos,translation,alt,tags,examples,forms) VALUES ${values.join(',')}`,
        params,
      )
      process.stdout.write(`\r  ${Math.min(i + BATCH, raw.length)}/${raw.length}`)
    }
    console.log('\nГотово.')
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => { console.error(err); process.exit(1) })
