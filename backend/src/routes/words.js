import { Router } from 'express'
import { dictionary } from '../dictionary.js'

const router = Router()

router.get('/search', async (req, res) => {
  try {
    const query = String(req.query.q ?? '')
    const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 200)
    const offset = Math.max(Number(req.query.offset) || 0, 0)
    res.json(await dictionary.search(query, { limit, offset }))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/alphabet', async (_req, res) => {
  try {
    res.json({ letters: await dictionary.getAlphabetSamples() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const word = await dictionary.getById(req.params.id)
    if (!word) {
      res.status(404).json({ error: 'Слово не найдено' })
      return
    }
    res.json(word)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
