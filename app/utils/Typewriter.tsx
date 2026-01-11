"use client";

import { useState, useEffect } from "react";

type TypewriterProps = {
    text: string;
    speed?: number;
};

export function Typewriter({ text, speed = 15 }: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (!text) {
            setDisplayedText("");
            return;
        }

        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => {
                if (index >= text.length) {
                    clearInterval(interval);
                    return prev;
                }
                const next = prev + text.charAt(index);
                index++;
                return next;
            });
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <p>{displayedText}</p>;
}
