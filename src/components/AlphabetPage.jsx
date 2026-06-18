import {WORDS} from '../data/words'

function AlphabetPage() {
    const letters = ['A a', 'Ä ä', 'B b', 'C c', 'Č č', 'D d', 'E e',
        'F f', 'G g', 'H h', 'I i', 'J j', 'K k', 'L l', 'M m', 'N n', 'O o',
        'Ö ö', 'P p', 'R r', 'S s', 'Š š', 'T t', 'U u', 'V v', 'Y y', 'Z z',
        'Ž ž', '’']

    return(
        <div>
            {letters.map(letter => {
                const word = WORDS.find(w => w.word.toLowerCase().startsWith(letter[0].toLowerCase()))
                return (
                    <div key={letter}>
                        <div>{letter}</div>
                        {word && <div>{word.word}</div>}
                    </div>
                )
            })}
        </div>

    )
}

export default AlphabetPage;