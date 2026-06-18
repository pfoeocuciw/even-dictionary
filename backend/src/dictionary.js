import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const WORDS_PATH = process.env.WORDS_FILE
  ?? resolve(__dirname, '../../words_llm.json')

function normalizeForms(forms) {
  if (!forms?.length) return []

  return forms.map((f) => ({
    name: f.label ?? f.case ?? f.name ?? '',
    sg: f.form ?? f.sg ?? '',
    pl: f.pl ?? null,
  }))
}

function normalizeWord(raw, id) {
  return {
    id,
    word: raw.word ?? '',
    ipa: raw.ipa ?? '',
    pos: raw.pos ?? '',
    translation: raw.translation ?? '',
    alt: raw.alt ?? '',
    tags: raw.tags ?? [],
    examples: raw.examples ?? [],
    forms: normalizeForms(raw.forms),
  }
}

function toSummary(word) {
  return {
    id: word.id,
    word: word.word,
    ipa: word.ipa,
    pos: word.pos,
    translation: word.translation,
  }
}

class Dictionary {
  #words = []
  #byId = new Map()

  load() {
    const raw = JSON.parse(readFileSync(WORDS_PATH, 'utf-8'))
    this.#words = raw.map((entry, index) => normalizeWord(entry, index + 1))
    this.#byId = new Map(this.#words.map((w) => [w.id, w]))
    console.log(`Загружено слов: ${this.#words.length}`)
  }

  get count() {
    return this.#words.length
  }

  getById(id) {
    return this.#byId.get(Number(id)) ?? null
  }

  search(query = '', { limit = 60, offset = 0 } = {}) {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? this.#words.filter((w) =>
          w.word.toLowerCase().includes(q)
          || w.translation.toLowerCase().includes(q),
        )
      : this.#words

    const slice = filtered.slice(offset, offset + limit)

    return {
      total: filtered.length,
      offset,
      limit,
      words: slice.map(toSummary),
    }
  }

  getAlphabetSamples() {
    const letters = [
      'A', 'Ä', 'B', 'C', 'Č', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Š', 'T', 'U', 'V', 'Y', 'Z', 'Ž', '’',
    ]

    return letters.map((letter) => {
      const ch = letter[0].toLowerCase()
      const word = this.#words.find((w) => w.word.toLowerCase().startsWith(ch))
      return { letter, word: word ? toSummary(word) : null }
    })
  }
}

export const dictionary = new Dictionary()
