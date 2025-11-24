"use client";

import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('./chatBot'), { ssr: false });

export default function ChatBotWrapper(){
    return <ChatBot />;
}