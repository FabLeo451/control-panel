'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Avatar URLs (esempi statici, puoi sostituirli con immagini reali o dinamiche)
const avatars = {
    user: 'https://i.pravatar.cc/40?img=3',
    bot: 'https://i.pravatar.cc/40?img=5',
};

const usernames = {
    user: 'You',
    bot: 'Bot',
};

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [userId] = useState(uuidv4()); // Genera ID univoco per l'utente
    const messagesEndRef = useRef(null);

    // CHAT STUFF

    const sendMessage = () => {
        if (!input.trim()) return;

        const message = {
            text: input,
            sender: 'user',
            userId: userId, // Aggiungi ID utente
            time: new Date().toISOString(),
        };
        /*
            const reply = {
              text: 'Hello',
              sender: 'bot',
              userId: 'bot', // ID per il bot
              time: new Date(Date.now() + 500).toISOString(),
            };*/

        // Aggiungi entrambi i messaggi con delay per simulare risposta
        setMessages((prev) => [...prev, message]);
        setInput('');
        /*
            setTimeout(() => {
              setMessages((prev) => [...prev, reply]);
            }, 500);*/

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(input);
            console.log('Message sent to server');
        }


    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    // Order by timestamp
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.time) - new Date(b.time)
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // WEBSOCKET STUFF

    const [message, setMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    useEffect(() => {

        const connectWebSocket = async () => {

            try {

                // Get a temporary token
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/token`, {
                    withCredentials: true, // NECESSARIO per mandare i cookie cross-site
                });

                // WebSocket
                const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${response.data.token}`);

                //console.log('socket = ', socket)

                // Eventi WebSocket
                socket.onopen = () => {
                    setConnectionStatus('Connected');
                    console.log('WebSocket connection opened');
                };

                socket.onmessage = (event) => {
                    setMessage(event.data);
                    console.log('Message from server:', event.data);

                    const reply = {
                        text: event.data,
                        sender: 'bot',
                        userId: 'bot', // ID per il bot
                        time: new Date(Date.now() + 500).toISOString(),
                    };

                    setMessages((prev) => [...prev, reply]);
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                socket.onclose = () => {
                    setConnectionStatus('Disconnected');
                    console.log('WebSocket connection closed');
                };

                // Salva la connessione WebSocket nello stato
                setWs(socket);

                // Cleanup al momento della disconnessione del componente
                return () => {
                    socket.close();
                    console.log('WebSocket connection closed on cleanup');
                };


            } catch (err) {

                if (!err.response) {
                    console.error('Network error: ' + err);
                } else {
                    // The server responded with a status other than 200 range
                    console.error(err.response.data.message);
                }
            }
        }

        connectWebSocket();

    }, []);

    /*
    const sendMessage = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('Hello Server!');
        console.log('Message sent to server');
      }
    };
  */
    return (
        <div className="max-w-xl mx-auto h-screen flex flex-col bg-white">
            {/* Area messaggi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 border border-gray-200 rounded-md m-4">
                {sortedMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        {/* Avatar (sinistra per bot, destra per utente) */}
                        {/*msg.sender === 'bot' && (
                            <img
                                src={avatars[msg.sender]}
                                alt="avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        )*/}

                        {/* Messaggio + Info */}
                        <div
                            className={`max-w-[80%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[40%] px-4 py-2 rounded-lg text-black text-sm ${msg.sender === 'user'
                                ? 'bg-green-100 text-right'
                                : 'bg-gray-200 text-left'
                                }`}
                        >
                            <div className="font-semibold text-xs text-gray-700 mb-1">
                                {usernames[msg.sender]}
                            </div>
                            <div>{msg.text}</div>
                            <div className="text-[10px] text-gray-500 mt-1">
                                {new Date(msg.time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>

                        {/* Avatar per utente (a destra) */}
                        {/*msg.sender === 'user' && (
                            <img
                                src={avatars[msg.sender]}
                                alt="avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        )*/}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-300">
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-6 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
