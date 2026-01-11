"use client";

import Image from "next/image";
import { useState, useEffect, useRef, memo } from "react";
import { BotMessageSquare, BrushCleaning, X } from "lucide-react";

import "./Chatbot.css";

const Typewriter = memo(({ text, speed = 15 }: { text: string; speed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText("");
        if (!text) return;

        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <>{displayedText}</>;
});

Typewriter.displayName = "Typewriter";

type Answer = {
    id: string;
    q: string;
    a: string;
};

export function Chatbot() {
    const [close, setClose] = useState(true);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState("pt-br");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [cooldown, setCooldown] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);
    const formRef = useRef<HTMLFormElement>(null);

    const instruction = `Você pode se apresentar como a Nebbot sempre que alguém perguntar sobre voce, uma assistente da Neppo (Grupo Sankhya).
Fundada em 2009; parte da Sankhya desde 2021; sediada em Uberlândia-MG. Especialista em Omnichannel integrada ao ERP Sankhya.
Suporte humano e rastreabilidade total de dados.
Centraliza WhatsApp, Redes Sociais, E-mail e Chat.
Automação 24/7 para vendas e cobrança.
Telefonia PABX em nuvem integrada.
Neppo Grow (leads) e Neppo Ticket (suporte).
comercial@neppo.com.br ou (34) 3256-3200.`;

    useEffect(() => {
        const savedLanguage = localStorage.getItem("chatbot-lang");
        if (savedLanguage) setLanguage(savedLanguage);
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        localStorage.setItem("chatbot-lang", language);

        if (!initializedRef.current) {
            const welcomeMsg =
                language === "pt-br"
                    ? "Olá! Eu sou a Nebbot, assistente virtual da Neppo. Como posso ajudar você hoje?"
                    : "Hello! I am Nebbot, Neppo's virtual assistant. How can I help you today?";

            setAnswers([
                {
                    id: "welcome-msg",
                    q: "",
                    a: welcomeMsg,
                },
            ]);

            initializedRef.current = true;
        }
    }, [language]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [answers, loading]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!question.trim() || loading || cooldown > 0) return;

        const currentQuestion = question.trim();
        setQuestion("");
        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch("https://gptagent.danielmazzeu.com.br/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    instruction,
                    question: currentQuestion,
                }),
            });


            if (!response.ok) throw new Error("API_ERROR");

            const data = await response.json();

            const finalAnswer =
                data.response ||
                (language === "pt-br"
                    ? "Desculpe, não consegui processar sua resposta."
                    : "Sorry, I couldn't process your response.");

            setAnswers((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    q: currentQuestion,
                    a: String(finalAnswer),
                },
            ]);

            setCooldown(10);
        } catch (error: any) {
            const isAbort = error?.name === "AbortError";

            const errorMsg = isAbort
                ? language === "pt-br"
                    ? "A resposta demorou muito e foi cancelada. Tente novamente."
                    : "The response took too long and was canceled. Please try again."
                : language === "pt-br"
                    ? "Tive um problema técnico. Pode tentar novamente em instantes?"
                    : "I had a technical problem. Can you try again in a moment?";

            setAnswers((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    q: currentQuestion,
                    a: errorMsg,
                },
            ]);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className={`chatbot ${!close ? "hidden" : ""}`}
                type="button"
                onClick={() => setClose(false)}
            >
                <BotMessageSquare />
            </button>

            <div className={`chatbot ${close ? "close" : ""}`}>
                <div className="header">
                    <Image
                        width={40}
                        height={40}
                        quality={100}
                        src="/logo.png"
                        alt="Logo Neppo"
                    />
                    <div>
                        <button
                            type="button"
                            className={language === "pt-br" ? "active" : ""}
                            onClick={() => setLanguage("pt-br")}
                        >
                            PT
                        </button>
                        <button
                            type="button"
                            className={language === "en" ? "active" : ""}
                            onClick={() => setLanguage("en")}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            onClick={() => setAnswers((prev) => prev.slice(0, 1))}
                        >
                            <BrushCleaning size={18} />
                        </button>
                        <button type="button" onClick={() => setClose(true)}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="answers" ref={scrollRef}>
                    {answers.map((item, index) => (
                        <div key={item.id} className="answer">
                            <h2>
                                <BotMessageSquare size={16} /> Nebbot
                            </h2>
                            <p>
                                {index === answers.length - 1 && index !== 0 ? (
                                    <Typewriter key={item.id} text={item.a} />
                                ) : (
                                    item.a
                                )}
                            </p>
                        </div>
                    ))}

                    {loading && (
                        <div className="answer">
                            <h2>
                                <Image
                                    width={20}
                                    height={20}
                                    quality={100}
                                    src="/logo.png"
                                    alt="Logo Neppo"
                                />{" "}
                                Nebbot
                            </h2>
                            <p>{language === "pt-br" ? "Pensando..." : "Thinking..."}</p>
                        </div>
                    )}
                </div>

                <form
                    ref={formRef}
                    className="question"
                    onSubmit={handleSubmit}
                >
                    <textarea
                        placeholder={
                            language === "pt-br"
                                ? "Escreva algo aqui..."
                                : "Type something here..."
                        }
                        maxLength={1000}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <div>
                        <button
                            type="submit"
                            disabled={loading || !question.trim() || cooldown > 0}
                            title={
                                cooldown > 0
                                    ? language === "pt-br"
                                        ? "Aguarde o tempo de espera"
                                        : "Wait for cooldown"
                                    : ""
                            }
                        >
                            {loading ? (
                                language === "pt-br" ? "Enviando..." : "Sending..."
                            ) : cooldown > 0 ? (
                                language === "pt-br"
                                    ? `Aguarde ${cooldown}s`
                                    : `Wait ${cooldown}s`
                            ) : (
                                language === "pt-br" ? "Enviar" : "Send"
                            )}
                        </button>
                        <span className={question.length >= 1000 ? "limit-reached" : ""}>
                            {question.length} / 1000
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}
