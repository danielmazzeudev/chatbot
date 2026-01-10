"use client";

import { useState, useEffect } from "react";

export function Typewriter({ text = "", speed = 15 }: { text: string; speed?: number }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText("");

        if (!text) {
            return;
        }

        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return <>{displayedText}</>;
}