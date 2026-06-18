import styled from 'styled-components'

function WordCard({ word, onClick }) {
    return (
        <StyledWrapper>
            <div className="card" onClick={onClick}>
        <span className="front">
          <p className="word">{word.word}</p>
          <p className="ipa">{word.ipa}</p>
        </span>
                <span className="back">
          <p className="translation">{word.translation}</p>
          <p className="pos">{word.pos}</p>
        </span>
            </div>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    .card {
        position: relative;
        width: 190px;
        height: 254px;
        background: rgb(255, 241, 210);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        cursor: pointer;
        overflow: hidden;
    }

    .front {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        z-index: 1;
        transition: opacity 0.3s;
    }

    .card:hover .front {
        opacity: 0;
    }

    .back {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        z-index: 1;
        transition: opacity 0.3s 0.2s;
    }

    .card:hover .back {
        opacity: 1;
    }

    .card::before,
    .card::after {
        position: absolute;
        content: "";
        width: 20%;
        height: 20%;
        background-color: #ffd1e0;
        transition: all 0.5s;
    }

    .card::before {
        top: 0;
        right: 0;
        border-radius: 0 15px 0 100%;
    }

    .card::after {
        bottom: 0;
        left: 0;
        border-radius: 0 100% 0 15px;
    }

    .card:hover::before,
    .card:hover::after {
        width: 100%;
        height: 100%;
        border-radius: 15px;
        transition: all 0.5s;
    }

    .word {
        font-size: 1.4em;
        font-weight: 900;
        color: #655353;
        text-align: center;
    }

    .ipa {
        font-size: 0.85em;
        color: #655353;
        opacity: 0.7;
        font-family: 'Libertinus', cursive;
    }

    .translation {
        font-size: 1.2em;
        font-weight: 700;
        color: #634242;
        text-align: center;
    }

    .pos {
        font-size: 0.8em;
        color: #634242;
        opacity: 0.85;
        font-style: italic;
    }
`

export default WordCard