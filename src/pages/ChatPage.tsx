import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, History, X, User, Trash2, Edit, Star, MessageSquare, BookOpen, ShoppingBag, Users } from 'lucide-react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type ContextType = {
  openSourcesPanel: () => void;
  openProductsPanel: () => void;
  openExpertsPanel: () => void;
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
  const { openSourcesPanel, openProductsPanel, openExpertsPanel } = useOutletContext<ContextType>();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  
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
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    updateChatSession(updatedMessages);
    
    setInput('');
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `${input.includes('wheat') ? 'Wheat' : 'This crop'} is one of the major crops grown in Nepal, particularly in the Terai and mid-hill regions. Here are the best practices for cultivation in this region...`,
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      updateChatSession(finalMessages);
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

  const confirmDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
  };

  const deleteChat = () => {
    if (!deletingChatId) return;
    
    if (chatSessions.length === 1) {
      toast({
        title: "Cannot delete chat",
        description: "You must have at least one chat session.",
        variant: "destructive"
      });
      setDeletingChatId(null);
      return;
    }
    
    const updatedSessions = chatSessions.filter(s => s.id !== deletingChatId);
    setChatSessions(updatedSessions);
    
    // If we're deleting the current chat, switch to another one
    if (deletingChatId === currentChatId) {
      const newCurrentChat = updatedSessions[0];
      setCurrentChatId(newCurrentChat.id);
      setMessages(newCurrentChat.messages);
    }
    
    setDeletingChatId(null);
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
  
  const handleActionButton = (type: 'sources' | 'products' | 'experts') => {
    if (type === 'sources') openSourcesPanel();
    else if (type === 'products') openProductsPanel();
    else if (type === 'experts') openExpertsPanel();
  };

  return (
    <div className="h-screen flex flex-col relative bg-[#1E2735]">
      <div className="p-4 flex justify-between items-center shadow-sm bg-cropsay-dark border-b border-cropsay-grayDark/30">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold">Cropsay AI Assistant</h1>
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
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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
                  <MessageSquare size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {showChatHistory && (
        <div className="absolute top-16 right-0 w-80 h-[calc(100vh-64px)] bg-[#1E2735] z-10 shadow-lg animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b border-cropsay-grayDark/30">
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
                    <div className="mb-4">
                      <h4 className="text-xs uppercase text-cropsay-grayText mb-2 px-2">Starred</h4>
                      {chatSessions
                        .filter(s => s.isStarred)
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map(session => (
                          <Card 
                            key={session.id}
                            onClick={() => switchToChat(session.id)}
                            className={cn(
                              "mb-2 cursor-pointer hover:bg-cropsay-darkSecondary transition-colors group relative border-cropsay-grayDark/30",
                              currentChatId === session.id ? "bg-cropsay-darkSecondary" : "bg-[#1E2735]"
                            )}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium truncate pr-8 flex-1">{session.title}</h4>
                                <span className="text-xs text-cropsay-grayText ml-1">
                                  {session.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-cropsay-grayText truncate">
                                {session.lastMessage || "New conversation"}
                              </p>
                              <div className="absolute right-3 top-3 hidden group-hover:flex space-x-1">
                                <button 
                                  onClick={(e) => toggleStarChat(session.id, e)}
                                  className="p-1 hover:bg-cropsay-dark rounded-full"
                                >
                                  <Star size={14} className="text-amber-400 fill-amber-400" />
                                </button>
                                <button 
                                  onClick={(e) => confirmDeleteChat(session.id, e)}
                                  className="p-1 hover:bg-cropsay-dark rounded-full text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </CardContent>
                          </Card>
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
                        <Card 
                          key={session.id}
                          onClick={() => switchToChat(session.id)}
                          className={cn(
                            "mb-2 cursor-pointer hover:bg-cropsay-darkSecondary transition-colors group relative border-cropsay-grayDark/30",
                            currentChatId === session.id ? "bg-cropsay-darkSecondary" : "bg-[#1E2735]"
                          )}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium truncate pr-8 flex-1">{session.title}</h4>
                              <span className="text-xs text-cropsay-grayText ml-1">
                                {session.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-cropsay-grayText truncate">
                              {session.lastMessage || "New conversation"}
                            </p>
                            <div className="absolute right-3 top-3 hidden group-hover:flex space-x-1">
                              <button 
                                onClick={(e) => toggleStarChat(session.id, e)}
                                className="p-1 hover:bg-cropsay-dark rounded-full"
                              >
                                <Star size={14} className="text-cropsay-grayText" />
                              </button>
                              <button 
                                onClick={(e) => confirmDeleteChat(session.id, e)}
                                className="p-1 hover:bg-cropsay-dark rounded-full text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-8 px-4 md:px-12 lg:px-24">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-center max-w-2xl">
              <h2 className="text-4xl font-bold mb-8">
                What do you want to know?
              </h2>
              
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl mt-10">
                {suggestionTopics.map((topic) => (
                  <button 
                    key={topic.text}
                    className="bg-black hover:bg-cropsay-darkSecondary text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 border border-cropsay-grayDark/30"
                    onClick={() => {
                      setInput(topic.text);
                    }}
                  >
                    <span className="text-xl">{topic.icon}</span>
                    <span>{topic.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex group/message",
                  message.role === 'user' ? "justify-end" : "justify-start",
                  index > 0 && messages[index-1].role === message.role ? "mt-2" : "mt-6"
                )}
              >
                {message.role !== 'user' && (
                  <div className={cn(
                    "bg-green-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0",
                    message.role === 'expert' && "bg-amber-500"
                  )}>
                    {message.role === 'expert' ? <User size={16} /> : 'C'}
                  </div>
                )}
                
                <div className={cn(
                  "rounded-2xl p-4 max-w-[85%] relative",
                  message.role === 'user' 
                    ? "bg-green-500 text-white rounded-tr-none" 
                    : message.role === 'expert'
                      ? "bg-gradient-to-br from-amber-600 to-amber-900 text-white rounded-tl-none"
                      : "bg-cropsay-darkSecondary text-white rounded-tl-none"
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
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Message timestamp */}
                      <div className="text-right mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      {/* Action buttons for AI responses */}
                      {message.role === 'assistant' && (
                        <div className="flex mt-3 space-x-2 justify-start">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-transparent border-cropsay-grayDark/30"
                            onClick={() => handleActionButton('sources')}
                          >
                            <BookOpen size={14} className="mr-1" /> Sources
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-transparent border-cropsay-grayDark/30"
                            onClick={() => handleActionButton('products')}
                          >
                            <ShoppingBag size={14} className="mr-1" /> Products
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-transparent border-cropsay-grayDark/30"
                            onClick={() => handleActionButton('experts')}
                          >
                            <Users size={14} className="mr-1" /> Experts
                          </Button>
                        </div>
                      )}
                      
                      {/* Message actions */}
                      {message.role === 'user' && (
                        <div className="absolute top-2 left-2 hidden group-hover/message:flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full bg-transparent hover:bg-green-600/80"
                            onClick={() => startEditingMessage(message)}
                          >
                            <Edit size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full bg-transparent hover:bg-green-600/80 text-red-300 hover:text-red-100"
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
      
      <div className="p-6 bg-[#1E2735]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center w-full rounded-xl bg-cropsay-dark p-3 focus-within:ring-1 focus-within:ring-green-500 transition-all border border-cropsay-grayDark/30">
            <button type="button" className="p-2 text-cropsay-grayText hover:text-cropsay-lightText">
              <Image size={20} />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none px-3 py-1"
            />
            
            <button type="button" className="p-2 text-cropsay-grayText hover:text-cropsay-lightText">
              <Mic size={20} />
            </button>
            
            <button 
              type="submit" 
              disabled={!input.trim()}
              className={`p-2 rounded-lg ${input.trim() ? 'text-green-500 hover:bg-cropsay-grayDark' : 'text-cropsay-grayText'}`}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-center text-cropsay-grayText mt-2">
            Cropsay can make mistakes. Check important information.
          </p>
        </div>
      </div>

      {/* Delete Chat Confirmation Dialog */}
      <AlertDialog open={!!deletingChatId} onOpenChange={(open) => !open && setDeletingChatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteChat} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatPage;
