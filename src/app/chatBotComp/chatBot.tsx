"use client";

import {v4 as uuidv4} from 'uuid';
import React, {useState, JSX} from 'react';
import './chatBot.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const SESSION_STORAGE_KEY = 'df_session_id';

function ChatBot() : JSX.Element {

    const [sessionId] = useState(() => { //como o site não possui sistema de login, usamos o localStorage para armazenar um ID único para cada usuário
    let id = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!id) { //se não houver um id armazenado, cria um novo
      id = uuidv4();
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id; //Retorna o id para o sessionId
    });
    const [messages, setMessages] = useState<Message[]>([]); //estado para armazenar o histórico de mensagens
    const [inputMessage, setInputMessage] = useState(''); //estado para armazenar a mensagem que o usuário está digitando
    const [isLoading, setIsLoading] = useState(false); //estado para indicar se o bot está "digitando"

    const sendMessage = async () => { //função para enviar a mensagem ao backend
        if (!inputMessage.trim() || isLoading) return; //verifica se a mensagem não está vazia e se o bot não está digitando, caso contrário, a mensagem não é enviada.
        const userMessage = inputMessage; //armazena a mensagem do usuário em uma variável temporária
        setMessages((prev)=>[...prev, {text: userMessage, sender: 'user'}]);
        // seta a mensagem do usuário no estado de mensagens como vindo do usuário
        setInputMessage(''); //limpa o campo de input após enviar a mensagem
        setIsLoading(true); //indica que o bot está "digitando"
        try { //tenta enviar a mensagem para o backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionId,
                }),
            });
            console.log("Resposta recebida da API:", response);
            const data = await response.json(); //extrai o JSON da resposta
            if (response.ok) {
                setMessages((prev)=>[...prev, {text: data.text, sender: 'bot'}]);
                //se a resposta for OK, adiciona a resposta do bot ao estado de mensagens como vindo do bot
            } else { //se a resposta não for OK, trata o erro
                const errorMsg = data.error || 'Erro de comunicação com a API';
                setMessages((prev)=>[...prev, {text: 'Error: ' + errorMsg, sender: 'bot'}]); //adiciona a mensagem de erro ao estado de mensagens para aparecer no chat
            }
        } catch (error) { //captura erros de conexão
            console.error('Erro de rede ou conexão:', error);
            setMessages((prev)=>[...prev, {text: 'Falha na Conexão', sender: 'bot'}]);
        }
        finally {
            setIsLoading(false); //indica que o bot parou de "digitar"
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }; //bloco só para enviar a mensagem se pressionar enter

    return (
        // <div className="fixed bottom-5 right-5 w-80 h-[500px] bg-white border-solid border-2 border-[#B54A22] rounded-lg shadow-xl flex flex-col z-50 p-5">
        <div className='caixa-chat'>
        
        <div className='topo-chat'>
            <span>Chat - Consultório Psicode</span>
        </div>

            {/* ÁREA DE MENSAGENS */}
            {/* <div className="flex-1 p-5 overflow-y-auto space-y-3"> */}
            <div className="area-mensagens-chat">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`p-2 rounded-xl max-w-[80%] 
                            ${msg.sender === 'user' 
                                ? 'bg-[#B54A22] text-white rounded-br-none' 
                                : 'bg-gray-200 text-gray-800 rounded-tl-none' 
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot loading text-gray-500 italic">
                        Digitando...
                    </div>
                )}
            </div>
            
            {/* ÁREA DE INPUT */}
            {/* <div className="p-4 border-t border-gray-200 flex space-x-2"> */}
            <div className="area-input-chat">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Pergunte ao consultório..."
                    // className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    className='input-chat'
                    disabled={isLoading}
                />
                <button 
                    onClick={sendMessage} 
                    disabled={isLoading}
                    // className="bg-[#B54A22] text-white p-2 rounded-lg hover:bg-[#8A3616] disabled:opacity-50 cursor-pointer"
                    className='botao-chat'
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}

export default ChatBot;