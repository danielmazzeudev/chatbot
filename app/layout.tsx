import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"; 

export const metadata: Metadata = {
    title: "Danbot",
    description: "Um agente especializado do Daniel Mazzeu.",
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