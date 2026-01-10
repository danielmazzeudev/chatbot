import { useState, useEffect } from "react";

export function Typewriter({ 
    text, 
    speed = 15, 
    onCharacterTyped
}: { 
    text: string; 
    speed?: number; 
    onCharacterTyped?: () => void; 
}) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => {
                    const nextText = prev + text.charAt(i);
                    if (onCharacterTyped) onCharacterTyped();
                    return nextText;
                });
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onCharacterTyped]);

    return <>{displayedText}</>;
}