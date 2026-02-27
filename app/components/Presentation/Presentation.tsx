import Image from "next/image";
import { BotMessageSquare } from "lucide-react";

import "./Presentation.css";

export function Presentation() {
    return (
        <main>
            <Image width={100} height={100} src="/logo.png" alt="Logo Daniel Mazzeu" />
            <h1>DANB<BotMessageSquare />T</h1>
            <p>
                O <strong>DANBOT</strong> é um assistente inteligente especializado no ecossistema <strong>DANIEL</strong>. 
                Ele irá indicar alguns projetos, email e links uteis para se conectar.
            </p>
            <small>
                Projetado e desenvolvido por Daniel Mazzeu.<br />
                &copy; 2026 Todos os direitos reservados.
            </small>
        </main>
    );
}