import { useEffect, useRef, useState, useCallback } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import WordCard from './components/WordCard'
import styles from './App.module.css'
import WordDetail from './components/WordDetail'
import { createGlobalStyle } from 'styled-components'
import AlphabetPage from './components/AlphabetPage'
import AboutPage from './components/AboutPage'
import { getWord, searchWords } from './api'

const GlobalStyle = createGlobalStyle`
* {
    font-family: 'Libertinus Serif', serif;
}
`

const PAGE_SIZE = 60

function App() {
  const [query, setQuery] = useState('')
  const [words, setWords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)
  const [loadingWord, setLoadingWord] = useState(false)
  const [page, setPage] = useState('home')
  const offsetRef = useRef(0)
  const sentinelRef = useRef(null)
  const abortRef = useRef(null)

  // Initial/reset load when query changes
  useEffect(() => {
    if (page !== 'home' || selectedWord) return undefined

    offsetRef.current = 0

    const controller = new AbortController()
    abortRef.current = controller
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchWords(query, {
          limit: PAGE_SIZE,
          offset: 0,
          signal: controller.signal,
        })
        offsetRef.current = data.words.length
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
  }, [query, page, selectedWord])

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return
    setLoadingMore(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const data = await searchWords(query, {
        limit: PAGE_SIZE,
        offset: offsetRef.current,
        signal: controller.signal,
      })
      offsetRef.current += data.words.length
      setWords((prev) => [...prev, ...data.words])
      setTotal(data.total)
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }, [query, loading, loadingMore])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  async function openWord(summary) {
    setLoadingWord(true)
    try {
      const full = await getWord(summary.id)
      setSelectedWord(full)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingWord(false)
    }
  }

  async function handleAlphabetWordClick(summary) {
    await openWord(summary)
    setPage('home')
  }

  const hasMore = words.length < total

  return (
    <div>
      <GlobalStyle />
      <Header
        onAlphabet={() => setPage('alphabet')}
        onHome={() => { setPage('home'); setSelectedWord(null) }}
        onAbout={() => setPage('about')}
      />

      {page === 'alphabet' ? (
        <AlphabetPage
          onWordClick={handleAlphabetWordClick}
          onBack={() => setPage('home')}
        />
      ) : page === 'about' ? (
        <AboutPage onBack={() => setPage('home')} />
      ) : selectedWord ? (
        <WordDetail word={selectedWord} onBack={() => setSelectedWord(null)} />
      ) : (
        <>
          <SearchBar query={query} setQuery={setQuery} />
          {loading && <p className={styles.status}>Загрузка…</p>}
          {loadingWord && <p className={styles.status}>Открываем карточку…</p>}
          <div className={styles.grid}>
            {words.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onClick={() => openWord(word)}
              />
            ))}
          </div>
          {!loading && hasMore && (
            <div ref={sentinelRef} className={styles.sentinel}>
              {loadingMore && <p className={styles.status}>Загружаем ещё…</p>}
            </div>
          )}
          {!loading && !hasMore && words.length > 0 && (
            <p className={styles.status}>Все {total} слов загружены</p>
          )}
        </>
      )}
    </div>
  )
}

export default App
