import styled from 'styled-components'

function Bubbles() {
    return (
        <StyledWrapper>
            <div className="bubble left1"><span/><span/><span/><span/><span/></div>
            <div className="bubble left2"><span/><span/><span/><span/><span/></div>
            <div className="bubble right1"><span/><span/><span/><span/><span/></div>
            <div className="bubble right2"><span/><span/><span/><span/><span/></div>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    .bubble {
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        pointer-events: none;
        animation: float 8s ease-in-out infinite;
        z-index: 0;
    }

    .left1  { left: 20px;  top: 280px; animation-delay: 0s; }
    .left2  { left: 30px;  top: 530px; animation-delay: -4s; width: 200px; height: 200px; }
    .right1 { right: 20px; top: 200px; animation-delay: -3s; }
    .right2 { right: 30px; top: 500px; animation-delay: -6s; width: 220px; height: 220px; }
    
    @keyframes float {
        0%, 100% { transform: translateY(-20px); }
        50%       { transform: translateY(20px); }
    }

    .bubble::before {
        content: '';
        position: absolute;
        top: 50px; left: 45px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: #fff;
        z-index: 10;
        filter: blur(3px);
    }

    .bubble::after {
        content: '';
        position: absolute;
        top: 90px; left: 90px;
        width: 25px; height: 25px;
        border-radius: 50%;
        background: #fff;
        z-index: 10;
        filter: blur(3px);
    }

    .bubble span { position: absolute; border-radius: 50%; }
    .bubble span:nth-child(1) { inset: 10px; border-left: 15px solid #0fb4ff; filter: blur(8px); }
    .bubble span:nth-child(2) { inset: 10px; border-right: 15px solid #ff4484; filter: blur(8px); }
    .bubble span:nth-child(3) { inset: 10px; border-top: 15px solid #ffeb3b; filter: blur(8px); }
    .bubble span:nth-child(4) { inset: 30px; border-left: 15px solid #ff4484; filter: blur(12px); }
    .bubble span:nth-child(5) { inset: 10px; border-bottom: 10px solid #fff; filter: blur(8px); transform: rotate(330deg); }
`

export default Bubbles