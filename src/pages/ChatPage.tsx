
import React, { useState } from 'react';
import { Send, Mic, Image, Globe, PlusCircle } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

type ContextType = {
  openSourcesPanel: () => void;
  openProductsPanel: () => void;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const ChatPage = () => {
  const { openSourcesPanel } = useOutletContext<ContextType>();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Wheat is one of the major crops grown in Nepal, particularly in the Terai and mid-hill regions. Here are the best practices for wheat cultivation in this region...`
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Auto open sources panel after AI responds
      setTimeout(() => {
        openSourcesPanel();
      }, 500);
    }, 1000);
  };

  const suggestionTopics = [
    { icon: '🌱', text: 'Crop Analysis' },
    { icon: '📦', text: 'Storage Solutions' },
    { icon: '💰', text: 'Market Prices' },
    { icon: '🧪', text: 'Soil Testing' },
    { icon: '📅', text: 'Crop Calendar' },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Chat header */}
      <div className="border-b border-cropsay-grayDark p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Cropsay</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-cropsay-grayDark">
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center">
            <h2 className="text-4xl font-bold mb-16">
              {messages.length === 0 ? 'How can I assist you with agriculture today?' : 'What do you want to know?'}
            </h2>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {suggestionTopics.map((topic) => (
                <button 
                  key={topic.text}
                  className="topic-button"
                  onClick={() => {
                    setInput(topic.text);
                  }}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                {message.role === 'assistant' && (
                  <div className="bg-cropsay-green text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    C
                  </div>
                )}
                <div className={`${message.role === 'assistant' ? 'bg-cropsay-darkSecondary' : 'bg-cropsay-green'} rounded-xl p-4 max-w-[80%]`}>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <div className="p-4 border-t border-cropsay-grayDark">
        <form onSubmit={handleSubmit} className="chat-input">
          <button type="button" className="p-2 text-cropsay-grayText hover:text-cropsay-lightText">
            <Image size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Cropsay..."
            className="flex-1 bg-transparent border-none outline-none px-3"
          />
          
          <button type="button" className="p-2 text-cropsay-grayText hover:text-cropsay-lightText">
            <Mic size={20} />
          </button>
          
          <button 
            type="submit" 
            disabled={!input.trim()}
            className={`p-2 ${input.trim() ? 'text-cropsay-green' : 'text-cropsay-grayText'}`}
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-xs text-center text-cropsay-grayText mt-2">
          Cropsay can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
