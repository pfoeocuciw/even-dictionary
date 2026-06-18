import { WORDS } from '../data/words'
import styled from 'styled-components'

function AlphabetPage({ onWordClick, onBack }) {
    const letters = ['A a', 'Ä ä', 'B b', 'C c', 'Č č', 'D d', 'E e',
        'F f', 'G g', 'H h', 'I i', 'J j', 'K k', 'L l', 'M m', 'N n', 'O o',
        'Ö ö', 'P p', 'R r', 'S s', 'Š š', 'T t', 'U u', 'V v', 'Y y', 'Z z',
        'Ž ž']

    return (
        <StyledWrapper>
            <button className="backBtn" onClick={onBack}>← Назад</button>
            <div className="grid">
                {letters.map(letter => {
                    const word = WORDS.find(w => w.word.toLowerCase().startsWith(letter[0].toLowerCase()))
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