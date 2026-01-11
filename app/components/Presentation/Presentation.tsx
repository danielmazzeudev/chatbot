import Image from "next/image";
import { BotMessageSquare } from "lucide-react";

import "./Presentation.css";

export function Presentation() {
    return (
        <main>
            <Image width={100} height={100} src="/logo.png" alt="Logo Neppo" />
            <h1>NEPB<BotMessageSquare />T</h1>
            <p>
                <strong>NEPBOT</strong> is an intelligent assistant specialized in the <strong>NEPPO</strong> ecosystem.
                Developed to improve processes and guide clients with maximum agility and solutions.
            </p>
            <small>
                Designed and developed by Daniel Mazzeu.<br />
                &copy; 2026 All rights reserved.
            </small>
        </main>
    );
}