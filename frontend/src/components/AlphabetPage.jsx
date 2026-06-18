import { useEffect, useState } from 'react'
import { getAlphabet } from '../api'

function AlphabetPage() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    getAlphabet({ signal: controller.signal })
      .then((data) => setLetters(data.letters))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  if (loading) return <p style={{ padding: 24 }}>Загрузка алфавита…</p>

  return (
    <div style={{ padding: 24 }}>
      {letters.map(({ letter, word }) => (
        <div key={letter}>
          <div>{letter}</div>
          {word && <div>{word.word}</div>}
        </div>
      ))}
    </div>
  )
}

export default AlphabetPage
