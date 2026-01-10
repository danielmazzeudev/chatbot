"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import"./Chatbot.css";

export function Chatbot() {
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState("pt-br");
    const [question, setQuestion] = useState("");
    
    return (
        <div className="chatbot">
            <div className="header">
                <img src="/logo.png" alt="Imagem da Logo da Neppo" />
                <div>
                    <button type="button" className={language === "pt-br" ? "active" : ""} onClick={() => setLanguage("pt-br")}>PT</button>
                    <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
                    <button type="button"><X /></button>
                </div>
            </div>
            <div className="answers">
                <div className="answer">
                    <h2>
                        {loading && <Loader2 />}
                        Nebbot
                    </h2>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                </div>
            </div>
            <form className="question">
                <textarea placeholder="Escreva algo aqui." maxLength={1000} value={question} onChange={(e) => setQuestion(e.target.value)}></textarea>
                <div>
                    <button type="submit" disabled={loading || question.length === 0}>
                        {loading ? "Enviando..." : "Enviar"}
                    </button>
                    <span>{question.length} / 1000</span>
                </div>
            </form>
        </div>
    );
}