import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, BarChart3, Sparkles, Bot, X } from 'lucide-react';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const DashboardContent = () => {
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'assistant', text: "👋 Hi there! I'm your AI career buddy. Ask me anything!" }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'AI Career Chatbot',
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-4-maverick:free',
                    messages: updatedMessages.map(msg => ({
                        role: msg.from === 'assistant' ? 'assistant' : 'user',
                        content: msg.text
                    })),
                    temperature: 0.7,
                    max_tokens: 256,
                }),
            });

            const data = await response.json();
            const botReply = data?.choices?.[0]?.message?.content;

            if (botReply?.trim()) {
                setMessages(prev => [...prev, { from: 'assistant', text: botReply }]);
            } else if (data?.error?.message) {
                setMessages(prev => [...prev, { from: 'assistant', text: `🚨 ${data.error.message}` }]);
            } else {
                setMessages(prev => [...prev, { from: 'assistant', text: '🤖 The AI did not provide a response.' }]);
            }
        } catch {
            setMessages(prev => [...prev, { from: 'assistant', text: '❌ Something went wrong. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const statCard = (icon, label, value, bgColor) => (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-4 p-6 rounded-xl shadow-md text-white ${bgColor}`}
        >
            <div className="p-3 rounded-full bg-white/20">{icon}</div>
            <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-lg">{label}</p>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            className="p-6 space-y-10 max-w-7xl mx-auto relative select-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <motion.h1 className="text-4xl font-bold text-gray-800">
                🚀 Welcome to Your AI Screening Dashboard
            </motion.h1>

            <div className="flex gap-5 justify-between">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard/upload')}
                    className="bg-green-700 text-white px-4 py-4 w-[50%] font-semibold rounded-xl text-xl shadow hover:bg-green-600 transition"
                >
                    🧑‍💻 Recruiter
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard/template')}
                    className="bg-blue-700 text-white px-4 py-4 w-[50%] font-semibold rounded-xl text-xl shadow hover:bg-blue-600 transition"
                >
                    🧑‍💼 Job Applier
                </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {statCard(<FileText className="w-6 h-6 text-white" />, "Resumes Uploaded", 172, "bg-indigo-600")}
                {statCard(<Users className="w-6 h-6 text-white" />, "Candidates Screened", 108, "bg-purple-600")}
                {statCard(<BarChart3 className="w-6 h-6 text-white" />, "Avg Match Score", "89%", "bg-pink-500")}
            </div>

            <div className="bg-gradient-to-r from-gray-100 to-white rounded-xl p-6 shadow-md space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Smart Career Assistant
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>For Applicants:</strong> Use the <span className="font-medium text-blue-600">Job Apply</span> tool to access AI-enhanced Canva templates.</li>
                    <li><strong>For Recruiters:</strong> Upload resumes to get instant AI screening reports.</li>
                    <li><strong>Smart Tip:</strong> Higher match scores come from keyword-aligned resumes.</li>
                    <li><strong>Pro Insight:</strong> Cover letters can improve selection chances by 37%.</li>
                </ul>
            </div>

            {/* Floating Chatbot Button */}
            <motion.button
                onClick={() => setShowChat(!showChat)}
                whileHover={{ scale: 1.1 }}
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-xl z-50"
            >
                <Bot className="w-6 h-6" />
            </motion.button>

            {/* Chatbot UI */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 right-6 bg-slate-300 rounded-2xl shadow-2xl w-[420px] h-[500px] flex flex-col z-50 overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-4 bg-primary text-white">
                            <p className="font-semibold">Robo Assistant</p>
                            <button onClick={() => setShowChat(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm" style={{ scrollbarWidth: "none" }}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg max-w-[80%] ${msg.from === 'assistant'
                                        ? 'bg-gray-100 text-gray-900 self-start'
                                        : 'bg-primary text-white self-end ml-auto'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="p-3 rounded-lg max-w-[80%] bg-gray-100 text-primary self-start">
                                    Thinking... <span className="animate-pulse">⏳</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t bg-slate-300">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask your doubt.."
                                    autoComplete="off"
                                    className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none placeholder:text-gray-900"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DashboardContent;
