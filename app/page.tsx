import { Chatbot } from "@/app/components/Chatbot/Chatbot";
import { Presentation } from "@/app/components/Presentation/Presentation";
import Background from "./components/Background/Background";

export default function Home() {
    return (
        <>
            <Background />
            <Presentation />
            <Chatbot />
        </>
    );
}
