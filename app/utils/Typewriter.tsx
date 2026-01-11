"use client";

import { useState, useEffect } from "react";

export function Typewriter({ text = "", speed = 15 }: { text: string; speed?: number }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText("");
        
        if (!text || text.length === 0) return;

        let i = 0;
        let currentText = "";

        const timer = setInterval(() => {
            if (i < text.length) {
                const char = text.charAt(i);
                currentText += char;
                setDisplayedText(currentText);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => {
            clearInterval(timer);
        };
    }, [text, speed]);

    return <span>{displayedText}</span>;
}