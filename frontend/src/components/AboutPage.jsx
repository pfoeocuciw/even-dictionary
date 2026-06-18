import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { getStats } from '../api'

function AboutPage({ onBack }) {
  const [wordCount, setWordCount] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getStats({ signal: controller.signal })
      .then((data) => setWordCount(data.words))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err)
      })
    return () => controller.abort()
  }, [])

  return (
    <StyledWrapper>
      <button className="backBtn" onClick={onBack}>← Назад</button>

      <div className="container">
        <h1 className="title">О словаре</h1>

        <div className="section">
          <p className="text">
            Вепсско-русский словарь — это удобный онлайн-инструмент для изучения и исследования вепсского языка.
            Здесь вы найдёте слова с транскрипцией, переводом, примерами употребления и грамматическими формами.
            Словарь создан для лингвистов, исследователей и всех, кто интересуется вепсским языком.
          </p>
        </div>

        <div className="section">
          <h2 className="subtitle">О вепсском языке</h2>
          <p className="text">
            Вепсский язык — язык вепсов, одного из финно-угорских народов России, проживающих
            на территории Карелии, Ленинградской и Вологодской областей. Язык относится к прибалтийско-финской
            ветви финно-угорской семьи и является близкородственным финскому и карельскому языкам.
            На сегодняшний день вепсский язык находится под угрозой исчезновения — число носителей
            составляет около 3000 человек. Сохранение и документация языка является важной задачей
            современной лингвистики.
          </p>
        </div>

        <div className="cards">
          <div className="infoCard">
            <span className="number">~3000</span>
            <span className="label">носителей языка</span>
          </div>
          <div className="infoCard">
            <span className="number">{wordCount ?? '…'}</span>
            <span className="label">слов в словаре</span>
          </div>
          <div className="infoCard">
            <span className="number">3</span>
            <span className="label">региона России</span>
          </div>
        </div>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  padding: 24px 48px;

  .backBtn {
    background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
    border: none;
    padding: 8px 20px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
    margin-bottom: 24px;
  }

  .container {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .title {
    font-size: 2.5em;
    font-weight: 700;
    color: rgb(80, 60, 120);
  }

  .subtitle {
    font-size: 1.4em;
    font-weight: 700;
    color: rgb(80, 60, 120);
    margin-bottom: 12px;
  }

  .section {
    background: rgb(255, 250, 245);
    border-radius: 16px;
    padding: 24px;
  }

  .text {
    font-size: 1em;
    line-height: 1.8;
    color: rgb(60, 50, 80);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .infoCard {
    background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
  }

  .number {
    font-size: 2em;
    font-weight: 700;
    color: rgb(80, 60, 120);
  }

  .label {
    font-size: 0.85em;
    color: rgb(120, 100, 160);
    text-align: center;
  }
`

export default AboutPage
