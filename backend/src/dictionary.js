import { pool } from './db.js'

function toSummary(row) {
  return {
    id: row.id,
    word: row.word,
    ipa: row.ipa,
    pos: row.pos,
    translation: row.translation,
  }
}

function toFull(row) {
  return {
    id: row.id,
    word: row.word,
    ipa: row.ipa,
    pos: row.pos,
    translation: row.translation,
    alt: row.alt,
    tags: row.tags,
    examples: row.examples,
    forms: row.forms,
  }
}

export const dictionary = {
  async load() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM words')
    console.log(`Слов в БД: ${rows[0].n}`)
    this._count = rows[0].n
  },

  get count() {
    return this._count ?? 0
  },

  async getById(id) {
    const { rows } = await pool.query('SELECT * FROM words WHERE id = $1', [Number(id)])
    return rows[0] ? toFull(rows[0]) : null
  },

  async search(query = '', { limit = 60, offset = 0 } = {}) {
    const q = query.trim()
    let totalRows, dataRows

    if (q) {
      const pattern = `%${q}%`
      ;({ rows: totalRows } = await pool.query(
        `SELECT COUNT(*)::int AS n FROM words
         WHERE word ILIKE $1 OR translation ILIKE $1`,
        [pattern],
      ))
      ;({ rows: dataRows } = await pool.query(
        `SELECT id,word,ipa,pos,translation FROM words
         WHERE word ILIKE $1 OR translation ILIKE $1
         ORDER BY
           CASE WHEN word ILIKE $2 THEN 0 ELSE 1 END,
           word
         LIMIT $3 OFFSET $4`,
        [pattern, `${q}%`, limit, offset],
      ))
    } else {
      ;({ rows: totalRows } = await pool.query('SELECT COUNT(*)::int AS n FROM words'))
      ;({ rows: dataRows } = await pool.query(
        'SELECT id,word,ipa,pos,translation FROM words ORDER BY id LIMIT $1 OFFSET $2',
        [limit, offset],
      ))
    }

    return {
      total: totalRows[0].n,
      offset,
      limit,
      words: dataRows.map(toSummary),
    }
  },

  async getAlphabetSamples() {
    const letters = [
      'A', 'Ä', 'B', 'C', 'Č', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Š', 'T', 'U', 'V', 'Y', 'Z', 'Ž', '’',
    ]

    const results = await Promise.all(
      letters.map(async (letter) => {
        const ch = letter[0].toLowerCase()
        const { rows } = await pool.query(
          `SELECT id,word,ipa,pos,translation FROM words
           WHERE lower(word) LIKE $1
           ORDER BY id LIMIT 1`,
          [`${ch}%`],
        )
        return { letter, word: rows[0] ? toSummary(rows[0]) : null }
      }),
    )
    return results
  },
}
