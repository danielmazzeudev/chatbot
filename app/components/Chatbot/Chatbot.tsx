"use client";

import { useState, useEffect } from "react";
import { BotMessageSquare, X, Loader2 } from "lucide-react";
import { Typewriter } from "@/app/utils/Typewriter";

import "./Chatbot.css";

export function Chatbot() {
    const [close, setClose] = useState(true);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState("pt-br");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);

    useEffect(() => {
        const welcomeMsg = language === "pt-br" 
            ? "Olá! Eu sou a Nebbot, assistente virtual da Neppo. Como posso ajudar você hoje?" 
            : "Hello! I am Nebbot, Neppo's virtual assistant. How can I help you today?";
        if (answers.length <= 1) {
            setAnswers([{ q: "", a: welcomeMsg }]);
        }
    }, [language]);

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
                    instruction: `Voce é uma agente chamada Nebbot, que responderá todas as questões referentes a empresa Neppot. Responda em ${language}.`,
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
                <BotMessageSquare size={30} />
            </button>
            <div className={`chatbot ${close ? "close" : ""}`}>
                <div className="header">
                    <img src="/logo.png" alt="Logo Neppo" />
                    <div>
                        <button type="button" className={language === "pt-br" ? "active" : ""} onClick={() => setLanguage("pt-br")}>PT</button>
                        <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
                        <button type="button" onClick={() => setClose(true)}><X size={20}/></button>
                    </div>
                </div>
                <div className="answers">
                    {answers.map((item, index) => (
                        <div key={index} className="answer">
                            <h2>Nebbot</h2>
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
                            <h2><Loader2 className="spinner" /> Nebbot</h2>
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