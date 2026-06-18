function Logo() {
    return (
        <svg width="200" height="60" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* книга */}
            <rect x="2" y="8" width="22" height="26" rx="3" fill="rgb(200, 180, 255)" />
            <rect x="6" y="8" width="18" height="26" rx="3" fill="rgb(220, 200, 255)" />
            <line x1="15" y1="8" x2="15" y2="34" stroke="rgb(180, 150, 255)" strokeWidth="1" />
            {/* буква В на книге */}
            <text x="8" y="26" fontSize="14" fontWeight="800" fill="white">В</text>
            {/*/!* текст *!/*/}
            {/*<text x="32" y="27" fontSize="16" fontWeight="700" fill="rgb(80, 60, 120)">вепс</text>*/}
            {/*<text x="74" y="27" fontSize="16" fontWeight="700" fill="#1D9E75">dict</text>*/}
        </svg>
    )
}

export default Logo