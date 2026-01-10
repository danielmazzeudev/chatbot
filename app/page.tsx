import { Chatbot } from "@/app/components/Chatbot/Chatbot";
import { Presentation } from "@/app/components/Presentation/Presentation";
import BackgroundBubbles from "./utils/Background";

export default function Home() {
    return (
        <>
            <BackgroundBubbles />
            <Presentation />
            <Chatbot />
        </>
    );
}
