import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, History, X, User, Trash2, Edit, Star, MessageSquare, BookOpen, ShoppingBag, Users, Search } from 'lucide-react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sourcesAvailable, setSourcesAvailable] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (chatSessions.length === 0) {
      const newChatId = Date.now().toString();
      const newSession: ChatSession = {
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

  useEffect(() => {
    // Check if we have at least one pair of user message followed by assistant message
    const hasQuestionAndAnswer = messages.length >= 2 && 
      messages.some((msg, i) => 
        msg.role === 'user' && 
        i < messages.length - 1 && 
        messages[i + 1].role === 'assistant'
      );
    
    if (hasQuestionAndAnswer) {
      // Dispatch custom event to notify that sources should be available
      const event = new Event('message-answered');
      window.dispatchEvent(event);
    }
  }, [messages]);

  useEffect(() => {
    const handleSourcesPanelActivation = () => {
      // Don't automatically open the sources panel
      // Just make it available for the user to click
      setSourcesAvailable(true);
    };

    window.addEventListener('message-answered', handleSourcesPanelActivation);

    return () => {
      window.removeEventListener('message-answered', handleSourcesPanelActivation);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `This is a simulated response to: "${input}"`,
        timestamp: new Date(),
      };
      
      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      
      // Update the current chat session
      updateChatSession(updatedMessages);
    }, 1000);
  };
  
  const updateChatSession = (updatedMessages: Message[]) => {
    const lastMessage = updatedMessages[updatedMessages.length - 1]?.content || '';
    
    setChatSessions(prev => prev.map(session => 
      session.id === currentChatId
        ? {
            ...session,
            messages: updatedMessages,
            lastMessage: lastMessage.substring(0, 60) + (lastMessage.length > 60 ? '...' : ''),
            timestamp: new Date(),
            title: session.title === 'New Conversation' && updatedMessages.length >= 2
              ? generateChatTitle(updatedMessages)
              : session.title
          }
        : session
    ));
  };
  
  const generateChatTitle = (messages: Message[]): string => {
    // Find the first user message to use as the title
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 30);
      return title + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    
    return 'New Conversation';
  };
  
  const startNewChat = () => {
    // If the current chat is empty, don't create a new one
    if (messages.length === 0) {
      return;
    }
    
    const newChatId = Date.now().toString();
    const newSession: ChatSession = {
      id: newChatId,
      title: 'New Conversation',
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
    const session = chatSessions.find(chat => chat.id === chatId);
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
    
    // Remove the chat session
    setChatSessions(prev => prev.filter(chat => chat.id !== deletingChatId));
    
    // If we're deleting the current chat, switch to another one
    if (deletingChatId === currentChatId) {
      const remainingSessions = chatSessions.filter(chat => chat.id !== deletingChatId);
      
      if (remainingSessions.length > 0) {
        // Switch to the most recent chat
        const mostRecentChat = remainingSessions.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        setCurrentChatId(mostRecentChat.id);
        setMessages(mostRecentChat.messages);
      } else {
        // If no chats left, create a new empty one
        startNewChat();
      }
    }
    
    setDeletingChatId(null);
  };
  
  const toggleStarChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setChatSessions(prev => prev.map(chat => 
      chat.id === chatId
        ? { ...chat, isStarred: !chat.isStarred }
        : chat
    ));
  };
  
  const startEditingMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };
  
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };
  
  const saveEditedMessage = (messageId: string) => {
    // Update the message in the current messages array
    const updatedMessages = messages.map(msg => 
      msg.id === messageId
        ? { ...msg, content: editContent }
        : msg
    );
    
    setMessages(updatedMessages);
    
    // Also update the message in the chat session
    updateChatSession(updatedMessages);
    
    // Reset editing state
    cancelEditing();
  };
  
  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    updateChatSession(updatedMessages);
  };
  
  // Sample suggestion topics
  const suggestionTopics = [
    { text: "How to grow tomatoes?", icon: "🍅" },
    { text: "Best fertilizer for wheat", icon: "🌾" },
    { text: "How to control pests naturally?", icon: "🐛" },
    { text: "When to harvest potatoes?", icon: "🥔" },
  ];
  
  const handleActionButton = (type: 'sources' | 'products' | 'experts') => {
    if (type === 'sources') openSourcesPanel();
    else if (type === 'products') openProductsPanel();
    else if (type === 'experts') openExpertsPanel();
  };

  // Filter chat sessions based on search query
  const filteredChatSessions = chatSessions.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChatSessions.filter(chat => chat.isStarred)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const recentChats = filteredChatSessions.filter(chat => !chat.isStarred)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 flex justify-between items-center shadow-sm bg-[#1E2735] border-b border-cropsay-grayDark/30">
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
                  onClick={() => setShowChatHistory(true)}
                  className="relative"
                  data-history-toggle
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
      
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto py-8 px-4 md:px-12 lg:px-24 bg-[#1E2735]">
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
          <div className="space-y-12 pb-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div key={message.id} className="mb-10 last:mb-4 group/message">
                {editingMessageId === message.id ? (
                  <div className="flex flex-col space-y-2">
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 rounded-lg bg-cropsay-darkSecondary text-cropsay-lightText border border-cropsay-grayDark/50 min-h-[100px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => saveEditedMessage(message.id)}
                        disabled={!editContent.trim()}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {/* Assistant message - no box, just text */}
                    {message.role === 'assistant' && (
                      <div className="max-w-[85%]">
                        <div className="flex items-start">
                          <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="white"/>
                              <path d="M9 12L11 14L15 10" stroke="#10141E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="prose prose-invert max-w-none text-cropsay-lightText">
                            {message.content}
                          </div>
                        </div>
                        
                        {/* ChatGPT-style icon buttons for assistant messages */}
                        <div className="flex items-center mt-2 ml-11 gap-2">
                          <button 
                            className="p-1 rounded-md hover:bg-[#2A3143] transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast({ description: "Message copied to clipboard" });
                            }}
                            title="Copy"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-200">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                          
                          <button 
                            className="p-1 rounded-md hover:bg-[#2A3143] transition-colors"
                            onClick={() => {/* Like functionality */}}
                            title="Like"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-200">
                              <path d="M7 10v12"></path>
                              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                            </svg>
                          </button>
                          
                          <button 
                            className="p-1 rounded-md hover:bg-[#2A3143] transition-colors"
                            onClick={() => {/* Dislike functionality */}}
                            title="Dislike"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-200">
                              <path d="M17 14V2"></path>
                              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                            </svg>
                          </button>
                          
                          <button 
                            className="p-1 rounded-md hover:bg-[#2A3143] transition-colors"
                            onClick={() => handleActionButton('sources')}
                            title="Sources"
                          >
                            <BookOpen size={16} className="text-gray-400 hover:text-gray-200" />
                          </button>
                          
                          <button 
                            className="p-1 rounded-md hover:bg-[#2A3143] transition-colors"
                            onClick={() => handleActionButton('products')}
                            title="Recommended Products"
                          >
                            <ShoppingBag size={16} className="text-gray-400 hover:text-gray-200" />
                          </button>
                          
                          <button 
                            className="p-1 rounded-md hover:bg-[#2A3143] transition-colors"
                            onClick={() => handleActionButton('experts')}
                            title="Experts"
                          >
                            <Users size={16} className="text-gray-400 hover:text-gray-200" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* User message - rounded box with no profile icon */}
                    {message.role === 'user' && (
                      <div className="relative group max-w-[85%]">
                        <div className="p-4 rounded-2xl bg-[#131725] hover:bg-[#192033] text-white">
                          <div className="prose prose-invert max-w-none">
                            {message.content}
                          </div>
                        </div>
                        
                        {/* Hover actions for user messages */}
                        <div className="absolute -bottom-6 right-2 hidden group-hover:flex gap-1 bg-[#1E2735] p-1 rounded-md shadow-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md bg-transparent hover:bg-[#212839] text-gray-400 hover:text-gray-200"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast({ description: "Message copied to clipboard" });
                            }}
                            title="Copy"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md bg-transparent hover:bg-[#212839] text-gray-400 hover:text-gray-200"
                            onClick={() => startEditingMessage(message)}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="sticky bottom-0 w-full py-4 bg-[#1E2735]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-[#10141E] rounded-xl border border-[#2A3143] shadow-lg">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-200"
                onClick={() => {/* Add attachment functionality */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
                  <path d="M8 12h8"></path>
                  <path d="M12 8v8"></path>
                </svg>
              </button>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 p-3 bg-transparent border-none focus:ring-0 focus:outline-none text-white resize-none h-12 max-h-[200px] overflow-y-auto"
                style={{ minHeight: '48px' }}
              />
              
              <button
                type="submit"
                disabled={!input.trim()}
                className={`p-2 rounded-lg mr-2 ${
                  input.trim() ? 'text-white bg-green-600 hover:bg-green-700' : 'text-gray-500 bg-gray-700 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"></path>
                  <path d="M22 2 11 13"></path>
                </svg>
              </button>
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-2">
              Cropsay can make mistakes. Check important info.
            </div>
          </form>
        </div>
      </div>

      {/* Chat History Dialog */}
      <Dialog open={showChatHistory} onOpenChange={setShowChatHistory}>
        <DialogContent className="sm:max-w-[500px] bg-[#10141E] border-[#2A3143]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Chat History</DialogTitle>
            <DialogDescription>
              View and manage your previous conversations
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1E2735] border-[#2A3143]"
              />
            </div>
          </div>
          
          <Button 
            onClick={startNewChat}
            className="w-full bg-green-500 hover:bg-green-600 mb-4"
          >
            New Chat
          </Button>
          
          <ScrollArea className="h-[400px] pr-4">
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <>
                <p className="text-sm text-cropsay-grayText px-2 mb-2">Pinned Chats</p>
                <div className="space-y-1 mb-4">
                  {pinnedChats.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        currentChatId === chat.id ? 'bg-[#1E2735]' : 'hover:bg-[#1E2735]'
                      }`}
                      onClick={() => switchToChat(chat.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-[#2A3143] text-yellow-400"
                          onClick={(e) => toggleStarChat(chat.id, e)}
                          title="Unpin"
                        >
                          <Star size={14} fill="currentColor" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-[#2A3143] text-gray-400 hover:text-red-400"
                          onClick={(e) => confirmDeleteChat(chat.id, e)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Recent Chats */}
            {recentChats.length > 0 ? (
              <>
                <p className="text-sm text-cropsay-grayText px-2 mb-2">Recent Chats</p>
                <div className="space-y-1">
                  {recentChats.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        currentChatId === chat.id ? 'bg-[#1E2735]' : 'hover:bg-[#1E2735]'
                      }`}
                      onClick={() => switchToChat(chat.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-[#2A3143] text-gray-400 hover:text-yellow-400"
                          onClick={(e) => toggleStarChat(chat.id, e)}
                          title="Pin"
                        >
                          <Star size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-[#2A3143] text-gray-400 hover:text-red-400"
                          onClick={(e) => confirmDeleteChat(chat.id, e)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : searchQuery && filteredChatSessions.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                No chats found matching "{searchQuery}"
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <AlertDialog open={!!deletingChatId} onOpenChange={(open) => !open && setDeletingChatId(null)}>
        <AlertDialogContent className="bg-[#10141E] border-[#2A3143]">
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
