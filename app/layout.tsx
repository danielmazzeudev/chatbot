import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"; 

export const metadata: Metadata = {
    title: "Nepbot",
    description: "Um agente especializado da empresa Neppot.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <body>
                <Analytics/>
                {children}
            </body>
        </html>
    );
}