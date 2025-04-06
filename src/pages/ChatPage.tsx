
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, Globe, PlusCircle, BookOpen, History, X, User, Bot } from 'lucide-react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContextType = {
  openSourcesPanel: () => void;
  openProductsPanel: () => void;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'expert';
  content: string;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
};

const ChatPage = () => {
  const { openSourcesPanel } = useOutletContext<ContextType>();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(searchParams.get('expert') === 'true');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize with a default chat session if none exists
  useEffect(() => {
    if (chatSessions.length === 0) {
      const newChatId = Date.now().toString();
      const newSession = {
        id: newChatId,
        title: 'New Conversation',
        lastMessage: '',
        timestamp: new Date(),
        messages: []
      };
      setChatSessions([newSession]);
      setCurrentChatId(newChatId);
    }
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Update chat session
    updateChatSession(updatedMessages);
    
    setInput('');
    
    // Simulate AI/expert response
    setTimeout(() => {
      const responseRole = isExpertMode ? 'expert' : 'assistant';
      const responseContent = isExpertMode 
        ? `As an agricultural expert, I recommend looking at ${input.includes('wheat') ? 'locally adapted wheat varieties' : 'sustainable farming practices'} for your specific region. Based on my experience, the most effective approach would be...`
        : `${input.includes('wheat') ? 'Wheat' : 'This crop'} is one of the major crops grown in Nepal, particularly in the Terai and mid-hill regions. Here are the best practices for cultivation in this region...`;
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: responseRole,
        content: responseContent,
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      updateChatSession(finalMessages);
      
      // Auto open sources panel after AI responds
      setTimeout(() => {
        openSourcesPanel();
      }, 500);
    }, 1000);
  };

  const updateChatSession = (updatedMessages: Message[]) => {
    // Find current chat session and update it
    setChatSessions(prev => prev.map(session => 
      session.id === currentChatId 
        ? { 
            ...session, 
            messages: updatedMessages,
            lastMessage: updatedMessages[updatedMessages.length - 1]?.content || '',
            timestamp: new Date()
          }
        : session
    ));
  };

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    const newSession = {
      id: newChatId,
      title: `New Conversation ${chatSessions.length + 1}`,
      lastMessage: '',
      timestamp: new Date(),
      messages: []
    };
    
    setChatSessions(prev => [...prev, newSession]);
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  const switchToChat = (chatId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (session) {
      setCurrentChatId(chatId);
      setMessages(session.messages);
      setShowChatHistory(false);
    }
  };

  const suggestionTopics = [
    { icon: '🌱', text: 'Crop Analysis' },
    { icon: '📦', text: 'Storage Solutions' },
    { icon: '💰', text: 'Market Prices' },
    { icon: '🧪', text: 'Soil Testing' },
    { icon: '📅', text: 'Crop Calendar' },
  ];

  return (
    <div className="h-screen flex flex-col relative">
      {/* Chat header */}
      <div className="p-4 flex justify-between items-center shadow-sm bg-cropsay-darkSecondary/50">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold">
            {isExpertMode ? 'Expert Consultation' : 'Cropsay AI Assistant'}
          </h1>
          {isExpertMode && (
            <span className="bg-cropsay-green text-white text-xs px-2 py-1 rounded-full">
              Expert Mode
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowChatHistory(!showChatHistory)}
            className="relative"
          >
            <History size={20} />
            {chatSessions.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-cropsay-green text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {chatSessions.length}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={startNewChat}
          >
            <PlusCircle size={20} />
          </Button>
        </div>
      </div>
      
      {/* Chat history sidebar */}
      {showChatHistory && (
        <div className="absolute top-16 right-0 w-72 h-[calc(100vh-64px)] bg-cropsay-darkSecondary z-10 shadow-lg animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b border-cropsay-grayDark">
            <h3 className="font-medium">Chat History</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowChatHistory(false)}>
              <X size={18} />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-56px)] p-2">
            <div className="space-y-2 p-2">
              {chatSessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => switchToChat(session.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:bg-cropsay-grayDark transition-colors",
                    currentChatId === session.id ? "bg-cropsay-grayDark" : "bg-cropsay-dark"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium truncate pr-2">{session.title}</h4>
                    <span className="text-xs text-cropsay-grayText">
                      {session.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-cropsay-grayText truncate">
                    {session.lastMessage || "New conversation"}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-center max-w-lg">
              <h2 className="text-3xl font-bold mb-8">
                {isExpertMode ? 'Chat with Agricultural Experts' : 'How can I assist you with agriculture today?'}
              </h2>
              
              <div className="mb-8">
                <p className="text-cropsay-grayText mb-6">
                  {isExpertMode
                    ? 'Our experts are ready to help with personalized advice for your farm.'
                    : 'Ask me anything about farming, crops, or agricultural practices.'}
                </p>
                
                <div className="flex justify-center">
                  <Button 
                    variant={isExpertMode ? "outline" : "default"} 
                    className={cn("mx-2", !isExpertMode && "bg-cropsay-green hover:bg-cropsay-green/90")}
                    onClick={() => setIsExpertMode(false)}
                  >
                    <Bot className="mr-2" size={18} />
                    AI Assistant
                  </Button>
                  <Button 
                    variant={isExpertMode ? "default" : "outline"}
                    className={cn("mx-2", isExpertMode && "bg-cropsay-green hover:bg-cropsay-green/90")}
                    onClick={() => setIsExpertMode(true)}
                  >
                    <User className="mr-2" size={18} />
                    Expert Mode
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {suggestionTopics.map((topic) => (
                  <button 
                    key={topic.text}
                    className="bg-cropsay-darkSecondary hover:bg-cropsay-grayDark text-cropsay-lightText px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}>
                {message.role !== 'user' && (
                  <div className={cn(
                    "bg-cropsay-green rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0",
                    message.role === 'expert' && "bg-amber-500"
                  )}>
                    {message.role === 'expert' ? <User size={16} /> : 'C'}
                  </div>
                )}
                
                <div className={cn(
                  "rounded-2xl p-4 max-w-[75%]",
                  message.role === 'user' 
                    ? "bg-cropsay-green text-white rounded-tr-none" 
                    : message.role === 'expert'
                      ? "bg-gradient-to-br from-amber-600 to-amber-900 text-white rounded-tl-none"
                      : "bg-cropsay-darkSecondary rounded-tl-none"
                )}>
                  <p className="leading-relaxed">{message.content}</p>
                  <div className="text-right mt-1">
                    <span className={cn(
                      "text-xs",
                      message.role === 'user' ? "text-cropsay-lightText/70" : "text-cropsay-grayText"
                    )}>
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="bg-cropsay-darkSecondary rounded-full w-8 h-8 flex items-center justify-center ml-3 flex-shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <div className="p-4 bg-cropsay-dark">
        <form onSubmit={handleSubmit} className="flex items-center w-full rounded-xl bg-cropsay-darkSecondary p-3 focus-within:ring-1 focus-within:ring-cropsay-green transition-all">
          <button type="button" className="p-2 text-cropsay-grayText hover:text-cropsay-lightText">
            <Image size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isExpertMode ? "Ask our agricultural experts..." : "Message Cropsay..."}
            className="flex-1 bg-transparent border-none outline-none px-3 py-1"
          />
          
          <button type="button" className="p-2 text-cropsay-grayText hover:text-cropsay-lightText">
            <Mic size={20} />
          </button>
          
          <button 
            type="submit" 
            disabled={!input.trim()}
            className={`p-2 rounded-lg ${input.trim() ? 'text-cropsay-green hover:bg-cropsay-grayDark' : 'text-cropsay-grayText'}`}
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-xs text-center text-cropsay-grayText mt-2">
          {isExpertMode ? 'Connecting you with agricultural experts.' : 'Cropsay can make mistakes. Check important information.'}
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
