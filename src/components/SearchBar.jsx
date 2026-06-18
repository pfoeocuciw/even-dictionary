import styled from 'styled-components'

function SearchBar({ query, setQuery }) {
    return (
        <StyledWrapper>
            <div className="InputContainer">
                <input
                    placeholder="Поиск слова..."
                    className="input"
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    .InputContainer {
        width: 210px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to bottom, rgb(255, 245, 213), rgb(255, 209, 224));
        border-radius: 30px;
        overflow: hidden;
        cursor: pointer;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
        margin: 16px 90px;
    }

    .input {
        width: 200px;
        height: 40px;
        border: none;
        outline: none;
        caret-color: rgb(255, 81, 0);
        background-color: rgb(255, 255, 255);
        border-radius: 30px;
        padding-left: 15px;
        letter-spacing: 0.8px;
        color: rgb(19, 19, 19);
        font-size: 13.4px;
    }
`

export default SearchBar