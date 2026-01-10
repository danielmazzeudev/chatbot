"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { BotMessageSquare, BrushCleaning, X, Loader2 } from "lucide-react";
import { Typewriter } from "@/app/utils/Typewriter";

import "./Chatbot.css";

export function Chatbot() {
    const [close, setClose] = useState(true);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState("pt-br");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const instruction = `Você é a Nebbot, a assistente virtual oficial da Neppo. Sua missão é fornecer informações precisas, úteis e profissionais sobre a empresa.
    
### CONTEXTO INSTITUCIONAL
- Empresa: Neppo (Especialista em Omnichannel e comunicação integrada).
- Ecossistema: Faz parte do Grupo Sankhya (desde 2021), integrando inteligência de comunicação ao maior ecossistema de ERP do Brasil.
- Trajetória: Fundada em 2009 (fábrica de software); 2017 (Lançamento Omnichannel); 2021 (Aquisição pela Sankhya); 2024 (+2 milhões de conversas geradas).
- Propósito: Transformar resultados por meio da comunicação, indo além de uma plataforma, entregando suporte forte e solução completa.

### PORTFÓLIO DE PRODUTOS E SOLUÇÕES
1. Omnichannel: Centralização de WhatsApp Business API Oficial, Instagram, Facebook Messenger, Telegram, E-mail, SMS e Webchat em uma única tela.
2. Chatbot & Fluxos: Atendimento 24/7, automação de dúvidas frequentes, fluxos de cobrança para reduzir inadimplência e fluxos de venda.
3. Neppo Voz: Solução de telefonia (PABX) em nuvem integrada à plataforma, com histórico e gravações.
4. Neppo Grow & Ticket: Ferramentas para gestão de leads e suporte/atendimento resolutivo.
5. Venda Digital & Chat Embarcado: Pontos de contato e conversão diretamente no site/sistema do cliente.

### DIFERENCIAIS COMPETITIVOS
- Integração nativa com ERP Sankhya.
- Suporte presente, humano e resolutivo.
- Foco em Vendas, Marketing e Atendimento em um só lugar.
- Rastreabilidade total de históricos de clientes, independente do canal.

### INFORMAÇÕES DE CONTATO E CARREIRA
- Comercial: comercial@neppo.com.br | (34) 3256-3200.
- Endereço: Av. Floriano Peixoto, n° 1615, Uberlândia - MG.
- Carreiras: Interessados em trabalhar na empresa são chamados de "Neppers". Devem consultar as vagas abertas no site oficial.

### DIRETRIZES DE COMPORTAMENTO
- Numca coloque ** ou *.
- Tom de Voz: Profissional, amigável, tecnológico e proativo.
- Idioma: Responda sempre no idioma solicitado (${language}).
- Restrição: Se não souber uma informação específica sobre preços personalizados ou contratos técnicos, oriente o usuário a entrar em contato com o time comercial pelo e-mail ou telefone informados.`;

    useEffect(() => {
        const savedLanguage = localStorage.getItem("chatbot-lang");
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("chatbot-lang", language);
    
        const welcomeMsg = language === "pt-br" 
            ? "Olá! Eu sou a Nepbot, assistente virtual da Neppo. Como posso ajudar você hoje?" 
            : "Hello! I am Nepbot, Neppo's virtual assistant. How can I help you today?";
        
        if (answers.length <= 1) {
            setAnswers([{ q: "", a: welcomeMsg }]);
        }
    }, [language]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const currentQuestion = question;
        setQuestion(""); 
        setLoading(true);

        try {
            const response = await fetch("https://gptagent.danielmazzeu.com.br/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instruction: instruction,
                    question: currentQuestion
                }),
            });
            
            const data = await response.json();
            setAnswers((prev) => [...prev, { q: currentQuestion, a: data.response }]);
        } catch (error) {
            console.error(error);
            const errorMsg = language === "pt-br" 
                ? "Desculpe, tive um problema técnico. Pode tentar novamente?" 
                : "Sorry, I had a technical problem. Can you try again?";
            setAnswers((prev) => [...prev, { q: currentQuestion, a: errorMsg }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button className={`chatbot ${!close ? "hidden" : ""}`} type="button" onClick={() => setClose(false)}>
                <BotMessageSquare />
            </button>
            <div className={`chatbot ${close ? "close" : ""}`}>
                <div className="header">
                    <Image width={40} height={40} src="/logo.png" alt="Logo Neppo" />
                    <div>
                        <button type="button" className={language === "pt-br" ? "active" : ""} onClick={() => setLanguage("pt-br")}>PT</button>
                        <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
                        <button type="button" onClick={() => setAnswers(prev => prev.slice(0, 1))}><BrushCleaning /></button>
                        <button type="button" onClick={() => setClose(true)}><X /></button>
                    </div>
                </div>
                <div className="answers">
                    {answers.map((item, index) => (
                        <div key={index} className="answer">
                            <h2><BotMessageSquare />Nepbot</h2>
                            <p>
                                {index === answers.length - 1 && index !== 0 ? (
                                    <Typewriter text={item.a} />
                                ) : (
                                    item.a
                                )}
                            </p>
                        </div>
                    ))}
                    {loading && (
                        <div className="answer">
                            <h2><Image width={20} height={20} src="/logo.png" alt="Logo Neppo" /> Nebbot</h2>
                            <p>{language === "pt-br" ? "Pensando..." : "Thinking..."}</p>
                        </div>
                    )}
                </div>
                <form className="question" onSubmit={handleQuestion}>
                    <textarea 
                        placeholder={language === "pt-br" ? "Escreva algo aqui..." : "Type something here..."} 
                        maxLength={1000} 
                        value={question} 
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleQuestion(e);
                            }
                        }}
                    />
                    <div>
                        <button type="submit" disabled={loading || question.length === 0}>
                            {loading 
                                ? (language === "pt-br" ? "Enviando..." : "Sending...") 
                                : (language === "pt-br" ? "Enviar" : "Send")
                            }
                        </button>
                        <span>{question.length} / 1000</span>
                    </div>
                </form>
            </div>
        </>
    );
}