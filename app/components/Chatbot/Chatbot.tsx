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

    const instruction = `Você é a Nebbot, assistente da Neppo (Grupo Sankhya). Forneça informações precisas e profissionais.

CONTEXTO:
- Neppo: Especialista em Omnichannel integrada ao ERP Sankhya.
- História: Fundada em 2009; parte da Sankhya desde 2021; sediada em Uberlândia-MG.
- Diferencial: Suporte humano e rastreabilidade total de dados.

SOLUÇÕES:
- Omnichannel: Centraliza WhatsApp, Redes Sociais, E-mail e Chat.
- Chatbots: Automação 24/7 para vendas e cobrança.
- Neppo Voz: Telefonia PABX em nuvem integrada.
- Gestão: Neppo Grow (leads) e Neppo Ticket (suporte).

DIRETRIZES:
- NUNCA utilize negrito (**) ou asteriscos (*) nas respostas.
- Responda exclusivamente no idioma: ${language}.
- Tom: Profissional, amigável e tecnológico.
- Comercial/Preços: Direcione para comercial@neppo.com.br ou (34) 3256-3200.
- Carreiras: Candidatos (Neppers) devem checar as vagas no site oficial.`;

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
        scrollToBottom();

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
                    <Image width={40} height={40} quality={100} src="/logo.png" alt="Logo Neppo" priority />
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
                            <h2>Nepbot <BotMessageSquare /></h2>
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
                            <h2><Image width={20} height={20} quality={100} src="/logo.png" alt="Logo Neppo" priority /> Nebbot</h2>
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
                                ? (language === "pt-br" ? "Pensando..." : "Thinking...") 
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