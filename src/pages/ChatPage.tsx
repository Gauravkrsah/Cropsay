
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, Globe, PlusCircle, BookOpen, History, X, User, Bot, Trash2, Edit, Star } from 'lucide-react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  isStarred?: boolean;
};

const ChatPage = () => {
  const { openSourcesPanel, openProductsPanel } = useOutletContext<ContextType>();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(searchParams.get('expert') === 'true');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    updateChatSession(updatedMessages);
    
    setInput('');
    
    setTimeout(() => {
      const responseRole = isExpertMode ? 'expert' as const : 'assistant' as const;
      const responseContent = isExpertMode 
        ? `As an agricultural expert, I recommend looking at ${input.includes('wheat') ? 'locally adapted wheat varieties' : 'sustainable farming practices'} for your specific region. Based on my experience, the most effective approach would be...`
        : `${input.includes('wheat') ? 'Wheat' : 'This crop'} is one of the major crops grown in Nepal, particularly in the Terai and mid-hill regions. Here are the best practices for cultivation in this region...`;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: responseRole,
        content: responseContent,
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      updateChatSession(finalMessages);
      
      setTimeout(() => {
        isExpertMode ? openProductsPanel() : openSourcesPanel();
      }, 500);
    }, 1000);
  };

  const updateChatSession = (updatedMessages: Message[]) => {
    setChatSessions(prev => prev.map(session => 
      session.id === currentChatId 
        ? { 
            ...session, 
            messages: updatedMessages,
            lastMessage: updatedMessages[updatedMessages.length - 1]?.content || '',
            timestamp: new Date(),
            title: generateChatTitle(updatedMessages)
          }
        : session
    ));
  };

  const generateChatTitle = (messages: Message[]): string => {
    if (messages.length === 0) return "New Conversation";
    
    // Find the first user message
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return "New Conversation";
    
    // Generate title from first user message (limit to 30 chars)
    const title = firstUserMessage.content.substring(0, 30);
    return title.length < firstUserMessage.content.length ? `${title}...` : title;
  };

  const startNewChat = () => {
    // Only allow new chat if current chat has messages
    const currentSession = chatSessions.find(s => s.id === currentChatId);
    if (!currentSession || currentSession.messages.length === 0) {
      toast({
        title: "Cannot create new chat",
        description: "Please start a conversation in the current chat first.",
        variant: "destructive"
      });
      return;
    }
    
    const newChatId = Date.now().toString();
    const newSession = {
      id: newChatId,
      title: `New Conversation`,
      lastMessage: '',
      timestamp: new Date(),
      messages: []
    };
    
    setChatSessions(prev => [...prev, newSession]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setShowChatHistory(false);
  };

  const switchToChat = (chatId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (session) {
      setCurrentChatId(chatId);
      setMessages(session.messages);
      setShowChatHistory(false);
    }
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (chatSessions.length === 1) {
      toast({
        title: "Cannot delete chat",
        description: "You must have at least one chat session.",
        variant: "destructive"
      });
      return;
    }
    
    setChatSessions(prev => prev.filter(s => s.id !== chatId));
    
    // If we're deleting the current chat, switch to another one
    if (chatId === currentChatId) {
      const remainingSessions = chatSessions.filter(s => s.id !== chatId);
      const newCurrentChat = remainingSessions[0];
      setCurrentChatId(newCurrentChat.id);
      setMessages(newCurrentChat.messages);
    }
  };
  
  const toggleStarChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.map(session => 
      session.id === chatId 
        ? { ...session, isStarred: !session.isStarred }
        : session
    ));
  };
  
  const startEditingMessage = (message: Message) => {
    if (message.role !== 'user') return;
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };
  
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };
  
  const saveEditedMessage = (messageId: string) => {
    if (!editContent.trim()) return;
    
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? {...msg, content: editContent} : msg
    );
    
    setMessages(updatedMessages);
    updateChatSession(updatedMessages);
    setEditingMessageId(null);
    setEditContent('');
  };
  
  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    updateChatSession(updatedMessages);
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>Chat History</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={startNewChat}
                >
                  <PlusCircle size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
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
              {chatSessions.length === 0 ? (
                <div className="p-3 text-center text-cropsay-grayText">
                  No chat history yet
                </div>
              ) : (
                <>
                  {/* Starred chats */}
                  {chatSessions.some(s => s.isStarred) && (
                    <div className="mb-2">
                      <h4 className="text-xs uppercase text-cropsay-grayText mb-2 px-2">Starred</h4>
                      {chatSessions
                        .filter(s => s.isStarred)
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map(session => (
                          <div 
                            key={session.id}
                            onClick={() => switchToChat(session.id)}
                            className={cn(
                              "p-3 rounded-lg cursor-pointer hover:bg-cropsay-grayDark transition-colors group relative",
                              currentChatId === session.id ? "bg-cropsay-grayDark" : "bg-cropsay-dark"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium truncate pr-2 flex-1">{session.title}</h4>
                              <span className="text-xs text-cropsay-grayText">
                                {session.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-cropsay-grayText truncate">
                              {session.lastMessage || "New conversation"}
                            </p>
                            <div className="absolute right-2 top-2 hidden group-hover:flex space-x-1">
                              <button 
                                onClick={(e) => toggleStarChat(session.id, e)}
                                className="p-1 hover:bg-cropsay-dark rounded-full"
                              >
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                              </button>
                              <button 
                                onClick={(e) => deleteChat(session.id, e)}
                                className="p-1 hover:bg-cropsay-dark rounded-full text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* Regular chats */}
                  <div>
                    {chatSessions.some(s => !s.isStarred) && (
                      <h4 className="text-xs uppercase text-cropsay-grayText mb-2 px-2">All Chats</h4>
                    )}
                    {chatSessions
                      .filter(s => !s.isStarred)
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map(session => (
                        <div 
                          key={session.id}
                          onClick={() => switchToChat(session.id)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer hover:bg-cropsay-grayDark transition-colors group relative",
                            currentChatId === session.id ? "bg-cropsay-grayDark" : "bg-cropsay-dark"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium truncate pr-2 flex-1">{session.title}</h4>
                            <span className="text-xs text-cropsay-grayText">
                              {session.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-cropsay-grayText truncate">
                            {session.lastMessage || "New conversation"}
                          </p>
                          <div className="absolute right-2 top-2 hidden group-hover:flex space-x-1">
                            <button 
                              onClick={(e) => toggleStarChat(session.id, e)}
                              className="p-1 hover:bg-cropsay-dark rounded-full"
                            >
                              <Star size={14} className="text-cropsay-grayText" />
                            </button>
                            <button 
                              onClick={(e) => deleteChat(session.id, e)}
                              className="p-1 hover:bg-cropsay-dark rounded-full text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      
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
                "flex group/message",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}>
                {message.role !== 'user' && (
                  <div className={cn(
                    "bg-cropsay-green rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0",
                    message.role === 'expert' && "bg-amber-500"
                  )}>
                    {message.role === 'expert' ? <User size={18} /> : 'C'}
                  </div>
                )}
                
                <div className={cn(
                  "rounded-2xl p-4 max-w-[75%] relative",
                  message.role === 'user' 
                    ? "bg-cropsay-green text-white rounded-tr-none" 
                    : message.role === 'expert'
                      ? "bg-gradient-to-br from-amber-600 to-amber-900 text-white rounded-tl-none"
                      : "bg-cropsay-darkSecondary rounded-tl-none"
                )}>
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-transparent border border-cropsay-grayDark rounded p-2 focus:outline-none focus:ring-1 focus:ring-white"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => saveEditedMessage(message.id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="leading-relaxed">{message.content}</p>
                      <div className="text-right mt-1">
                        <span className={cn(
                          "text-xs",
                          message.role === 'user' ? "text-cropsay-lightText/70" : "text-cropsay-grayText"
                        )}>
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      {/* Message actions */}
                      {message.role === 'user' && (
                        <div className="absolute top-2 left-2 hidden group-hover/message:flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full bg-transparent hover:bg-cropsay-green/80"
                            onClick={() => startEditingMessage(message)}
                          >
                            <Edit size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full bg-transparent hover:bg-cropsay-green/80 text-red-300 hover:text-red-100"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="bg-cropsay-darkSecondary rounded-full w-10 h-10 flex items-center justify-center ml-3 flex-shrink-0">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
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
