import type { Metadata } from "next";
import { Nunito, Zain } from "next/font/google";
import "./globals.css";
import ChatBot from "./chatBotComp/chatBot";
import ChatBotWrapper from "./chatBotComp/chatBotWrapper";
import 'bootstrap-icons/font/bootstrap-icons.css';

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

const zain = Zain({
  variable: "--font-zain",
  weight: ["200","300","400","700","800","900"]
})

export const metadata: Metadata = {
  title: "Psicode",
  description: "O lugar para os programadores resolverem seus problemas de uma maneira melhor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${nunito.variable} ${zain.variable} antialiased`}
      >
        {children}
        <ChatBotWrapper />
      </body>
    </html>
  );
}
