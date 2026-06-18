import styled from 'styled-components'
import Bubbles from "./Bubbles";

function WordDetail({word, onBack}) {
    return (
        <StyledWrapper>
            <Bubbles/>
            <button className="backBtn" onClick={onBack}>← Назад</button>
            <div className="container">

                <div className="top">
                    <h1 className="word">{word.word}</h1>
                    <span className="ipa">{word.ipa}</span>
                    <span className="pos">{word.pos}</span>
                </div>

                <div className="section">
                    <p className="label">Перевод</p>
                    <p className="value">{word.translation}</p>
                    <p className="alt">{word.alt}</p>
                </div>

                {word.examples.length > 0 && (
                    <div className="section">
                        <p className="label">Пример</p>
                        {word.examples.map((ex, i) => (
                            <div key={i} className="example">
                                <p className="exSrc">{ex.src}</p>
                                <p className="exTr">{ex.tr}</p>
                            </div>
                        ))}
                    </div>
                )}

                {word.forms.length > 0 && (
                    <div className="section">
                        <p className="label">Парадигма</p>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Форма</th>
                                <th>Ед.число</th>
                                <th>Мн.число</th>
                            </tr>
                            </thead>
                            <tbody>
                            {word.forms.map((form, i) => (
                                <tr key={i}>
                                    <td>{form.name}</td>
                                    <td>{form.sg}</td>
                                    <td>{form.pl || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
  padding: 24px;

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

  .container {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .top {
    display: flex;
    align-items: baseline;
    gap: 16px;
    flex-wrap: wrap;
  }

  .word {
    font-size: 2.5em;
    font-weight: 900;
    color: rgb(80, 60, 120);
  }

  .ipa {
    font-size: 1em;
    color: rgba(0,0,0,0.4);
    font-family: 'Libertinus', cursive; 
  }

  .pos {
    padding: 4px 12px;
    border-radius: 20px;
    background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
    font-size: 0.85em;
    color: rgb(80, 60, 120);
  }

  .section {
    background: rgb(255, 250, 245);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(0,0,0,0.35);
  }

  .value {
    font-size: 1.4em;
    font-weight: 700;
    color: rgb(80, 60, 120);
  }

  .alt {
    font-size: 0.9em;
    color: rgba(0,0,0,0.45);
  }

  .example {
    border-left: 3px solid rgb(200, 180, 255);
    padding-left: 12px;
  }

  .exSrc {
    font-size: 1em;
    font-weight: 500;
  }

  .exTr {
    font-size: 0.9em;
    color: rgba(0,0,0,0.45);
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .table th {
    text-align: left;
    padding: 8px 12px;
    background: rgb(240, 235, 255);
    color: rgb(80, 60, 120);
    font-size: 12px;
  }

  .table td {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
    @media (max-width: 768px) {
        .bubble {
            display: none;
        }
    }
`

export default WordDetail