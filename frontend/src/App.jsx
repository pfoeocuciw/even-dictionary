import { useEffect, useState } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import WordCard from './components/WordCard'
import styles from './App.module.css'
import WordDetail from './components/WordDetail'
import { createGlobalStyle } from 'styled-components'
import AlphabetPage from './components/AlphabetPage'
import { getWord, searchWords } from './api'

const GlobalStyle = createGlobalStyle`
* {
    font-family: 'Libertinus Serif', serif;
}
`

function App() {
  const [query, setQuery] = useState('')
  const [words, setWords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState(null)
  const [loadingWord, setLoadingWord] = useState(false)
  const [page, setPage] = useState('home')

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchWords(query, { signal: controller.signal })
        setWords(data.words)
        setTotal(data.total)
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  async function handleSelectWord(summary) {
    setLoadingWord(true)
    try {
      const word = await getWord(summary.id)
      setSelectedWord(word)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingWord(false)
    }
  }

  return (
    <div>
      <GlobalStyle />
      <Header
        onAlphabet={() => setPage('alphabet')}
        onHome={() => {
          setPage('home')
          setSelectedWord(null)
        }}
      />

      {page === 'alphabet' ? (
        <AlphabetPage />
      ) : selectedWord ? (
        <WordDetail word={selectedWord} onBack={() => setSelectedWord(null)} />
      ) : (
        <>
          <SearchBar query={query} setQuery={setQuery} />
          {loading && <p className={styles.status}>Загрузка…</p>}
          {!loading && total > words.length && (
            <p className={styles.status}>
              Показано {words.length} из {total}. Уточните поиск, чтобы найти нужное слово.
            </p>
          )}
          {loadingWord && <p className={styles.status}>Открываем карточку…</p>}
          <div className={styles.grid}>
            {words.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onClick={() => handleSelectWord(word)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default App
