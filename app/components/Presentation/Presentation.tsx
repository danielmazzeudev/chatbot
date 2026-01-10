import Image from "next/image";
import { BotMessageSquare } from "lucide-react";

import "./Presentation.css";

export function Presentation() {
    return (
        <main>
            <Image width={100} height={100} src="/logo.png" alt="Logo Neppo" />
            <h1>NEPBOT<BotMessageSquare /></h1>
            <p>
                O Nepbot é um assistente inteligente especializado no ecossistema NEPPOT. 
                Desenvolvido para otimizar processos e guiar clientes com máxima agilidade e precisão.
            </p>
            <small>
                Elaborado e desenvolvido por Daniel Mazzeu.<br />
                &copy; 2026 Todos os direitos reservados.
            </small>
        </main>
    );
}