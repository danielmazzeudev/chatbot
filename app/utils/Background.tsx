"use client";

import { useEffect, useState } from "react";
import "./Background.css";

const BackgroundBubbles = () => {
    const [bubbles, setBubbles] = useState<Array<{id: number; size: number; left: number; top: number; color: string}>>([]);

    useEffect(() => {
        const colors = ["#252c3bcc", "#65cc65cc"];

        const createBubble = () => ({
            id: Math.random(),
            size: Math.random() * 5 + 100,
            left: Math.random() * 100,
            top: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)] 
        });

        const interval = setInterval(() => {
            setBubbles(prev => [...prev.slice(-15), createBubble()]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bubble-container">
            {bubbles.map(bubble => (
                <span
                    key={bubble.id}
                    className="bubble"
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: `${bubble.left}%`,
                        top: `${bubble.top}%`,
                        backgroundColor: bubble.color
                    }}
                />
            ))}
        </div>
    );
};

export default BackgroundBubbles;