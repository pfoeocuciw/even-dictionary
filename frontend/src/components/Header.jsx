import styled from 'styled-components'

function Header({ onHome, onAlphabet, onAbout }) {
    return (
        <StyledWrapper>
            <header className="header">
                <div className="left" onClick={onHome}>
                    <span className="title">Веппско-русский словарь</span>
                </div>
                <nav className="nav">
                    {["Алфавит", "О словаре"].map((link) => (
                        <span key={link} onClick={
                            link === "Алфавит" ? onAlphabet :
                                link === "О словаре" ? onAbout :
                                    undefined
                        } className="navLink">
              {link}
            </span>
                    ))}
                </nav>
            </header>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    .header {
        display: flex;
        align-items: center;
        padding: 12px 24px;
        background: linear-gradient(to right, rgb(227, 213, 255), rgb(255, 231, 231));
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
        position: relative;
    }

    .header::after {
        content: '';
        position: absolute;
        bottom: -15px;
        left: 0;
        width: 100%;
        height: 20px;
        background: linear-gradient(to right, rgb(227, 213, 255), rgb(255, 231, 231));
        mask-image: radial-gradient(circle at 10px 20px, transparent 12px, black 13px);
        mask-size: 20px 20px;
        mask-repeat: repeat-x;
    }
    
    .title {
        font-family: 'Libertinus Serif', cursive;
        font-size: 22px;
        font-weight: bolder;
        cursor: pointer;
    }

    .left {
        cursor: pointer;
        flex: 1;
        display: flex;
    }

    .nav {
        display: flex;
        gap: 8px;
    }

    .navLink {
        padding: 8px 16px;
        border-radius: 30px;
        background: white;
        font-size: 18px;
        cursor: pointer;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
        color: rgb(19, 19, 19);
        transition: background 0.2s;
    }

    .navLink:hover {
        background: rgb(227, 213, 255);
    }
`

export default Header