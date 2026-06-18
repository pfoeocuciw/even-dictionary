import express from 'express'
import cors from 'cors'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { dictionary } from './dictionary.js'
import wordsRouter from './routes/words.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const FRONTEND_DIST = resolve(__dirname, '../../frontend/dist')

dictionary.load()

const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
  }))
}

app.use('/api/words', wordsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, words: dictionary.count })
})

if (existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST, { index: false }))
  app.get('*', (_req, res) => {
    res.sendFile(resolve(FRONTEND_DIST, 'index.html'))
  })
} else {
  app.get('/', (_req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Even Dictionary API</title></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 48px auto; line-height: 1.5;">
  <h1>API-сервер словаря</h1>
  <p>В режиме разработки сайт открывается через Vite, не через этот порт.</p>
  <p>Запустите во втором терминале <code>cd frontend && npm run dev</code> и откройте адрес из вывода Vite (обычно <a href="http://127.0.0.1:5173/">http://127.0.0.1:5173/</a>).</p>
  <p>API: <a href="/api/health">/api/health</a></p>
</body>
</html>`)
  })
}

const server = app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nПорт ${PORT} уже занят — бэкенд уже запущен в другом терминале.`)
    console.error('Закройте тот процесс или освободите порт:\n')
    console.error(`  netstat -ano | findstr :${PORT}`)
    console.error('  taskkill /PID <номер_процесса> /F\n')
    process.exit(1)
  }
  throw err
})
