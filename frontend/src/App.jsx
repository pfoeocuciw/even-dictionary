import { useState } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import WordCard from './components/WordCard'
import {WORDS} from './data/words'
import styles from './App.module.css'
import WordDetail from "./components/WordDetail";
import {createGlobalStyle } from "styled-components";
import AlphabetPage from "./components/AlphabetPage";
import AboutPage from "./components/AboutPage";

const GlobalStyle = createGlobalStyle`
* {
    font-family: 'Libertinus Serif', serif;
}
`

function App() {
    const [query, setQuery] = useState('')
    const filtered = WORDS.filter((word) =>
        word.word.toLowerCase().includes(query.toLowerCase()))
    const [selectedWord, setSelectedWord] = useState(null)
    const [page, setPage] = useState('home')
    return (
        <div>
            <GlobalStyle />
            <Header onAlphabet={() => setPage('alphabet')} onHome={() => { setPage('home'); setSelectedWord(null) }} onAbout={() => setPage('about')}/>

            {page === 'alphabet' ? (
                <AlphabetPage
                    onWordClick={(word) => { setSelectedWord(word); setPage('home') }}
                    onBack={() => setPage('home')}
                />
            ) : page === 'about' ? (
                <AboutPage onBack={() => setPage('home')} />
            ) : selectedWord ? (
                <WordDetail word={selectedWord} onBack={() => setSelectedWord(null)} />
            ) : (
                <>
                    <SearchBar query={query} setQuery={setQuery} />
                    <div className={styles.grid}>
                        {filtered.map(word => (
                            <WordCard key={word.id} word={word} onClick={() => setSelectedWord(word)} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
export default App
