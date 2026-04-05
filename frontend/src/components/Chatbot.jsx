import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
  
  // 🧠 Chat History Memory
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('eliteAutoChatHistory');
    if (savedChat) {
      return JSON.parse(savedChat);
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false); 
  const [isBotReady, setIsBotReady] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // ⚡ Quick Action Chips
  const quickActions = [
    "What cars do you have?",
    "Show me cars under 8,000,000",
    "Do you have any Hondas?"
  ];

  useEffect(() => {
    localStorage.setItem('eliteAutoChatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = 'en-US'; 

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInput(transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setInput(''); 
    }
  };

  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    let cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'); 
    cleanText = cleanText.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); 

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || voice.name.includes('Samantha') || 
      voice.name.includes('Zira') || voice.name.includes('Victoria') || 
      voice.name.includes('Google UK English Female') 
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.rate = 1.0; 
    utterance.pitch = 1.2; 
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  // 🚀 Start Bot (No need to load generative-ai here anymore)
  useEffect(() => {
    setIsBotReady(true);
    if (messages.length === 0) {
      setMessages([
        { text: "Hi there! I'm Elite AI, your Data Analyst Agent. I have direct access to our live inventory. What would you like to know?", sender: 'bot' }
      ]);
    }
    // eslint-disable-next-line
  }, []); 

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isTyping]);

  // 🤖 Send Message to Python Data Analyst Agent
  const sendMessageToBot = async (textToSend) => {
    if (!textToSend.trim() || !isBotReady) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setInput('');
    setMessages(prev => [...prev, { text: textToSend, sender: 'user' }]);
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:5000/ask-agent', { 
        question: textToSend,
      email: loggedInUser?.email || "Guest User"
     });
      
      if (res.data.status === 'success') {
        const responseText = res.data.answer;
        setMessages(prev => [...prev, { text: responseText, sender: 'bot' }]);
        speakText(responseText);
      } else {
        setMessages(prev => [...prev, { text: "Sorry, I ran into an issue finding that data.", sender: 'bot' }]);
      }
    } catch (error) {
      console.error("Data Agent API Error:", error);
      setMessages(prev => [...prev, { text: "Connection error! Is the Python server running?", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessageToBot(input);
  };

  const clearChatHistory = () => {
    localStorage.removeItem('eliteAutoChatHistory');
    window.location.reload(); 
  };

  const renderMessageWithLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const buttonText = match[1];
      const targetUrl = match[2];

      parts.push(
        <button 
          key={match.index} 
          onClick={() => { 
            console.log("Navigating to URL:", targetUrl); 
            navigate(targetUrl); 
            setIsOpen(false); 
          }}
          className="inline-block mt-2 mb-1 px-4 py-1.5 bg-[#0096ff]/10 hover:bg-[#0096ff] text-[#0096ff] hover:text-white border border-[#0096ff]/30 hover:border-[#0096ff] rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          {buttonText}
        </button>
      );
      lastIndex = linkRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      
      {isOpen && (
        <div className="bg-white dark:bg-[#11181f] w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
          
          <div className="bg-gradient-to-r from-[#0096ff] to-[#00d4ff] p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm border border-white/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs">Elite AI Data Agent</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isBotReady ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                  <span className="text-white/80 text-[9px] font-bold tracking-widest">
                    {isBotReady ? 'Live Connected' : 'Syncing Data...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={clearChatHistory} 
                className="text-white/80 hover:text-white hover:bg-red-500/80 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                title="Clear Chat History"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <button 
                onClick={() => { setIsMuted(!isMuted); if (!isMuted) window.speechSynthesis?.cancel(); }} 
                className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center"
                title={isMuted ? "Unmute Bot Voice" : "Mute Bot Voice"}
              >
                {isMuted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                )}
              </button>

              <button onClick={() => { setIsOpen(false); window.speechSynthesis?.cancel(); }} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0d1117] scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-[#0096ff] text-white rounded-br-sm' 
                    : 'bg-white dark:bg-[#1a2228] text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-bl-sm'
                }`}>
                  {msg.sender === 'bot' ? renderMessageWithLinks(msg.text) : msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#1a2228] border border-slate-100 dark:border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#0096ff]/50 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#0096ff]/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#0096ff] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white dark:bg-[#11181f] border-t border-slate-100 dark:border-white/5 relative flex flex-col">
            
            {messages.length < 5 && isBotReady && (
              <div className="flex gap-2 px-3 pt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {quickActions.map((action, idx) => (
                  <button 
                    key={idx}
                    onClick={() => sendMessageToBot(action)}
                    className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-[#1a2228] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full hover:bg-[#0096ff] hover:text-white dark:hover:bg-[#0096ff] transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {isListening && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#ef4444] text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-md z-20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                Listening...
              </div>
            )}

            <div className="p-3">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening to you..." : (isBotReady ? "Ask about our inventory..." : "Please wait...")} 
                  disabled={!isBotReady}
                  className="w-full bg-slate-100 dark:bg-[#1a2228] border border-transparent focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm rounded-xl pl-4 pr-20 py-3 outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
                
                <button 
                  type="button"
                  onClick={toggleListening}
                  disabled={!isBotReady}
                  className={`absolute right-12 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isListening 
                      ? 'text-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20' 
                      : 'text-slate-400 hover:text-[#0096ff] hover:bg-[#0096ff]/10'
                  }`}
                  title="Voice Search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 18v4m-4 0h8M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3z" />
                  </svg>
                </button>

                <button type="submit" disabled={!input.trim() || isTyping || !isBotReady} className="absolute right-2 w-8 h-8 bg-[#0096ff] hover:bg-[#0080e6] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-[#0096ff] hover:bg-[#0080e6] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0096ff]/40 transition-transform hover:scale-110 active:scale-95 group relative">
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-[#0d1117] rounded-full animate-pulse"></span>
          <svg className="w-6 h-6 group-hover:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <svg className="w-7 h-7 hidden group-hover:block animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

    </div>
  );
}

export default Chatbot;