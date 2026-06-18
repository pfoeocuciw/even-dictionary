import { Router } from 'express'
import { dictionary } from '../dictionary.js'

const router = Router()

router.get('/search', (req, res) => {
  const query = String(req.query.q ?? '')
  const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 200)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  res.json(dictionary.search(query, { limit, offset }))
})

router.get('/alphabet', (_req, res) => {
  res.json({ letters: dictionary.getAlphabetSamples() })
})

router.get('/:id', (req, res) => {
  const word = dictionary.getById(req.params.id)
  if (!word) {
    res.status(404).json({ error: 'Слово не найдено' })
    return
  }
  res.json(word)
})

export default router
