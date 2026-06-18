import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { getAlphabet } from '../api'

const LETTERS = ['A a', 'Ä ä', 'B b', 'C c', 'Č č', 'D d', 'E e',
  'F f', 'G g', 'H h', 'I i', 'J j', 'K k', 'L l', 'M m', 'N n', 'O o',
  'Ö ö', 'P p', 'R r', 'S s', 'Š š', 'T t', 'U u', 'V v', 'Y y', 'Z z',
  'Ž ž']

function AlphabetPage({ onWordClick, onBack }) {
  const [letterWords, setLetterWords] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    getAlphabet({ signal: controller.signal })
      .then((data) => {
        const map = {}
        for (const { letter, word } of data.letters) {
          map[letter] = word
        }
        setLetterWords(map)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <StyledWrapper>
        <button className="backBtn" onClick={onBack}>← Назад</button>
        <p className="status">Загрузка алфавита…</p>
      </StyledWrapper>
    )
  }

  return (
    <StyledWrapper>
      <button className="backBtn" onClick={onBack}>← Назад</button>
      <div className="grid">
        {LETTERS.map((letter) => {
          const apiLetter = letter.split(' ')[0]
          const word = letterWords[apiLetter]
          return (
            <div
              key={letter}
              className={word ? 'card active' : 'card empty'}
              onClick={() => word && onWordClick(word)}
            >
              <span className="letter">{letter}</span>
            </div>
          )
        })}
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
    padding: 32px 48px;

    .grid {
        display: grid;
        grid-template-columns: repeat(7, 110px);
        gap: 40px;
        justify-content: center;
    }

    .backBtn {
        background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
        border: none;
        padding: 8px 20px;
        border-radius: 30px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.075);
        margin-bottom: 24px;
    }

    .status {
        text-align: center;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
    }

    .card {
        border-radius: 16px;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        min-height: 110px;
        justify-content: center;
        transition: transform 0.2s;
    }

    .active {
        background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
        cursor: pointer;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
    }

    .active:hover {
        transform: translateY(-4px);
    }

    .empty {
        background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
        opacity: 0.5;
    }

    .letter {
        font-size: 1.8em;
        font-weight: 700;
        color: rgb(0, 0, 0);
    }

    .word {
        font-size: 0.85em;
        color: rgb(0, 0, 0);
        text-align: center;
        font-family: 'Libertinus', cursive;
    }
`

export default AlphabetPage
