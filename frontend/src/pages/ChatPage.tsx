import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, History, X, User, Trash2, Edit, Star, MessageSquare, BookOpen, ShoppingBag, Users, Search, Check, Leaf, Droplets, Bug, ChevronDown, ChevronUp, Info, BarChart, Home, ChevronRight } from 'lucide-react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { ChatTextGenerateEffect } from '@/components/ui/chat-text-generate-effect';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { chatService } from '@/services/chatService';
import { geminiService } from '@/services/geminiService';
import { supabase, getUserId } from '@/integrations/supabase/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';


// Import custom fonts for better typography
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';

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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>(''); // Will be set based on authentication
  const [serviceInitialized, setServiceInitialized] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  
  const { user } = useAuth(); // Get authentication state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [isAddingNewMessage, setIsAddingNewMessage] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Ref to control streaming speed
  const streamingSpeedRef = useRef<number>(5); // Default to 5ms
  // Ref to control stopping the streaming
  const stopRequestedRef = useRef<boolean>(false);
  // Helper to access stopRequested in callbacks
  const getStopRequested = () => stopRequestedRef.current;
  // Pause/Resume state
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  // Function to handle pause/resume streaming
  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };
  
  // Hide scrollbars when chat page is active
  useEffect(() => {
    document.body.classList.add('chat-active');
    return () => {
      document.body.classList.remove('chat-active');
    };
  }, []);

  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Function to adjust height
    const adjustHeight = () => {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height (with a minimum of 64px)
      const newHeight = Math.max(64, Math.min(textarea.scrollHeight, 240));
      
      // Set the new height
      textarea.style.height = `${newHeight}px`;
    };
    
    // Adjust height initially and add event listener
    adjustHeight();
    textarea.addEventListener('input', adjustHeight);
    
    // Clean up
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, [input]); // Re-run when input changes

  // Initialize the chat service
  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('Initializing chat service...');
        const success = await chatService.init();
        console.log('Chat service initialization:', success ? 'successful' : 'failed');
        setServiceInitialized(success);
      } catch (error) {
        console.error('Error initializing chat service:', error);
        toast({
          description: "Failed to connect to database. Some features may not work properly.",
          variant: "destructive"
        });
      }
    };
    
    initializeService();
  }, []);
  
  // Reset chat when user logs out
  // Also update userId when auth state changes
  useEffect(() => {
    if (user) {
      // Set userId to the authenticated user's ID
      console.log('User authenticated, setting userId to:', user.id);
      setUserId(user.id);
    } else {
      // If user is null (logged out) and we had a previous session, reset to a new chat
      if (messages.length > 0) {
        console.log('User logged out, resetting chat');
        // Create a new empty session
        const newChatId = Date.now().toString();
        const newSession: ChatSession = {
          id: newChatId,
          title: 'New Conversation',
          lastMessage: '',
          timestamp: new Date(),
          messages: []
      };

      // Reset state
      setCurrentChatId(newChatId);
      setMessages([]);
      setChatSessions([newSession]);
    }

      // For non-authenticated users, use a temporary ID
      const tempUserId = getUserId();
      console.log('User not authenticated, using temporary userId:', tempUserId);
      setUserId(tempUserId);
    }
  }, [user]);
  
  // Load chat sessions from Supabase when component mounts and service is initialized
  useEffect(() => {
    if (!serviceInitialized || !userId) return;

    const loadChatSessions = async () => {
      try {
        setLoading(true);
        console.log('Loading chat sessions for user:', userId);

        // If user is not logged in, just create a new empty session
        if (!user) {
          console.log('No user logged in, creating new empty session');
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
          setLoading(false);
          return;
        }

        // Load sessions from database (authenticated users) or localStorage (non-authenticated)
        const sessions = await chatService.getChatSessions(userId);
        console.log('Loaded sessions:', sessions);
        
        if (sessions && sessions.length > 0) {
          // Transform the data to match our expected format
          const formattedSessions = sessions.map(session => ({
            id: session.id,
            title: session.title,
            lastMessage: session.last_message || '',
            timestamp: new Date(session.timestamp),
            messages: session.messages.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            })),
            isStarred: session.is_starred
          }));
          
          setChatSessions(formattedSessions);
          
          // Set current chat to the most recent one
          const mostRecentChat = formattedSessions.sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          )[0];
          
          setCurrentChatId(mostRecentChat.id);
          setMessages(mostRecentChat.messages || []);
        } else {
          // If no sessions found, create a new empty one
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
          
          // Save the new session to Supabase
          await chatService.createChatSession(newSession, userId);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        toast({
          description: "Failed to load chat history. Starting with a new chat.",
          variant: "destructive"
        });
        
        // Fallback to a new chat
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
      } finally {
        setLoading(false);
      }
    };
    
    loadChatSessions();
  }, [userId, serviceInitialized]);

  // Enhanced scrolling effect for messages - only auto-scroll when appropriate
  useEffect(() => {
    if (!messagesEndRef.current || !chatContainerRef.current) return;

    // Don't auto-scroll during streaming to allow user to scroll freely
    if (isStreaming && !isAddingNewMessage) return;

    const container = chatContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    // Only auto-scroll in these specific cases:
    // 1. User is at the bottom and hasn't manually scrolled away
    // 2. It's a new conversation (first 2 messages)
    // 3. A new message was just added (not streaming content updates)
    const isNewConversation = messages.length <= 2;
    const shouldAutoScroll = (isAtBottom && !userScrolled) || isNewConversation || isAddingNewMessage;

    if (shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({
        behavior: isNewConversation ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  }, [messages.length, isAddingNewMessage]); // Only trigger on message count change or new message flag

  // Handle scroll detection for scroll-to-top button and user scroll tracking
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let scrollTimeout: NodeJS.Timeout;
    let isUserScrolling = false;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isAtBottom = distanceFromBottom < 50;

      // Show scroll-to-top button on mobile
      if (isMobile) {
        setShowScrollTop(!isAtBottom && scrollTop > 300);
      }

      // Only mark as user scrolled if they're significantly away from bottom
      // and it's not an automatic scroll
      if (!isUserScrolling && distanceFromBottom > 100) {
        setUserScrolled(true);
      }

      // Reset user scroll state when they return to bottom
      if (isAtBottom) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setUserScrolled(false);
          isUserScrolling = false;
        }, 500);
      }
    };

    // Detect programmatic scrolls vs user scrolls
    const handleScrollStart = () => {
      isUserScrolling = true;
    };

    const handleScrollEnd = () => {
      setTimeout(() => {
        isUserScrolling = false;
      }, 100);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    chatContainer.addEventListener('touchstart', handleScrollStart);
    chatContainer.addEventListener('touchend', handleScrollEnd);
    chatContainer.addEventListener('mousedown', handleScrollStart);
    chatContainer.addEventListener('mouseup', handleScrollEnd);

    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
      chatContainer.removeEventListener('touchstart', handleScrollStart);
      chatContainer.removeEventListener('touchend', handleScrollEnd);
      chatContainer.removeEventListener('mousedown', handleScrollStart);
      chatContainer.removeEventListener('mouseup', handleScrollEnd);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile]);

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

  // Check if user can send message (logged in users can send unlimited, non-logged in only one)
  const canSendMessage = () => {
    // Don't allow sending if quota is exhausted
    if (quotaExhausted) return false;
    
    // Logged in users can always send messages
    if (user) return true;
    
    // Non-logged in users can only send one message
    // Check if there's already a user message
    const hasUserMessage = messages.some(msg => msg.role === 'user');
    return !hasUserMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Store the input before clearing it
    const userInput = input.trim();
    
    // Check if user can send this message
    if (!canSendMessage()) {
      setShowLoginPrompt(true);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsAddingNewMessage(true);
    
    // Reset textarea height to default
    if (textareaRef.current) {
      textareaRef.current.style.height = '64px';
    }
    
    // Create a unique ID for the response message that will be used throughout the function
    const tempId = (Date.now() + 1).toString();
    
    try {
      // Show thinking indicator immediately
      setIsThinking(true);

      // Show a loading state with empty content
      const loadingMessage: Message = {
        id: tempId,
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
      };
      setMessages([...newMessages, loadingMessage]);
      setIsStreaming(true);
      setIsAddingNewMessage(false);

      let streamedContent = '';
      let streamingStopped = false;

      try {
        await geminiService.generateResponse(
          newMessages.map(msg => ({ role: msg.role, content: msg.content })),
          (token) => {
            if (streamingStopped) return;

            // Hide thinking animation on first token
            if (streamedContent === '') {
              setIsThinking(false);
            }

            // Accumulate streamed content
            streamedContent += token;

            // Update messages immediately for smooth streaming
            setMessages(currentMessages => {
              const updatedMessages = [...currentMessages];
              const loadingMessageIndex = updatedMessages.findIndex(msg => msg.id === tempId);
              if (loadingMessageIndex !== -1) {
                updatedMessages[loadingMessageIndex] = {
                  ...updatedMessages[loadingMessageIndex],
                  content: streamedContent
                };
              }
              return updatedMessages;
            });
          }
        );
        streamingStopped = true;
        setIsThinking(false);
        setIsStreaming(false);
        setIsAddingNewMessage(false);

        // After streaming is complete, finalize the message immediately
        const finalAiResponse: Message = {
          id: tempId,
          role: 'assistant' as const,
          content: streamedContent,
          timestamp: new Date(),
        };
        const updatedMessages = [...newMessages, finalAiResponse];
        setMessages(updatedMessages);
        updateChatSession(updatedMessages);
      } catch (error) {
        streamingStopped = true;
        setIsThinking(false);
        setIsStreaming(false);
        setIsAddingNewMessage(false);
        console.error('Error in streaming response:', error);
      }
      if (!user) {
        setTimeout(() => {
          setShowLoginPrompt(true);
        }, 1000);
      }
    } catch (error) {
      setIsThinking(false);
      setIsStreaming(false);
      console.error('Error generating response:', error);
      const isQuotaError = error?.message?.includes('quota') || 
                          error?.message?.includes('429') ||
                          error?.toString?.().includes('quota') ||
                          error?.toString?.().includes('429');
      let errorMessage = "Failed to generate response. Please try again.";
      let errorTitle = "Error";
      if (isQuotaError) {
        setQuotaExhausted(true);
        errorMessage = "We've reached our daily AI usage limit. Please try again tomorrow or contact support for premium access.";
        errorTitle = "Daily Limit Reached";
        const quotaErrorResponse: Message = {
          id: tempId,
          role: 'assistant' as const,
          content: "I'm sorry, but we've reached our daily AI usage limit for today. This helps us manage costs while providing free access to agricultural information. Please try again tomorrow, or contact our support team if you need immediate assistance with urgent agricultural questions.",
          timestamp: new Date(),
        };
        const updatedMessagesWithError = [...newMessages, quotaErrorResponse];
        setMessages(updatedMessagesWithError);
        updateChatSession(updatedMessagesWithError);
        setQuotaExhausted(true);
        setTimeout(() => {
          setShowLoginPrompt(true);
        }, 1000);
      } else {
        setMessages(newMessages);
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const updateChatSession = async (updatedMessages: Message[]) => {
    try {
      const lastMessage = updatedMessages[updatedMessages.length - 1]?.content || '';
      let title = '';
      
      // Get the current chat session
      const currentSession = chatSessions.find(session => session.id === currentChatId);
      if (!currentSession) {
        console.error('Current chat session not found');
        return;
      }
      
      // Generate title if this is a new conversation with at least 2 messages
      if (currentSession.title === 'New Conversation' && updatedMessages.length >= 2) {
        title = await generateChatTitle(updatedMessages);
      } else {
        title = currentSession.title;
      }
      
      // Create updated session object
      const updatedSession = {
        id: currentChatId,
        title: title,
        lastMessage: lastMessage.substring(0, 60) + (lastMessage.length > 60 ? '...' : ''),
        timestamp: new Date(),
        messages: updatedMessages,
        isStarred: currentSession.isStarred || false
      };
      
      // Update state
      setChatSessions(prev => {
        const updated = prev.map(session => 
          session.id === currentChatId ? updatedSession : session
        );
        console.log('Updated chat sessions:', updated);
        return updated;
      });
      
      // Check if the session exists in Supabase
      try {
        const { data } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', currentChatId)
          .single();
        
        if (data) {
          // Update existing session
          await chatService.updateChatSession(updatedSession);
          await chatService.updateChatMessages(updatedMessages, currentChatId);
        } else {
          // Create new session
          await chatService.createChatSession(updatedSession, userId);
        }
      } catch (error) {
        // If error is about no rows returned, create new session
        console.log('Session not found, creating new one');
        await chatService.createChatSession(updatedSession, userId);
      }
    } catch (error) {
      console.error('Error saving chat session:', error);
      toast({
        description: "Failed to save your chat. Your data may be lost if you refresh.",
        variant: "destructive"
      });
    }
  };
  
  const generateChatTitle = async (messages: Message[]): Promise<string> => {
    if (messages.length === 0) return 'New Conversation';
    
    try {
      // Find the first user message
      const firstUserMessage = messages.find(m => m.role === 'user');
      
      if (!firstUserMessage) return 'New Conversation';
      
      // Use Gemini to generate a title
      const title = await geminiService.generateChatTitle(firstUserMessage.content);
      return title;
    } catch (error) {
      console.error('Error generating chat title:', error);
      
      // Check if it's a quota error
      const isQuotaError = error?.message?.includes('QUOTA_EXCEEDED') || 
                          error?.message?.includes('quota') || 
                          error?.message?.includes('429');
      
      if (isQuotaError) {
        // For quota errors, generate a simple title based on keywords
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (firstUserMessage) {
          const content = firstUserMessage.content.toLowerCase();
          if (content.includes('fertilizer')) return 'Fertilizer Question';
          if (content.includes('plant') || content.includes('grow')) return 'Plant Growing Question';
          if (content.includes('pest')) return 'Pest Control Question';
          if (content.includes('soil')) return 'Soil Question';
          if (content.includes('water')) return 'Watering Question';
          return 'Agricultural Question';
        }
      }
      
      return 'New Conversation';
    }
  };
  
  const startNewChat = async () => {
    try {
      const newChatId = Date.now().toString();
      const newSession: ChatSession = {
        id: newChatId,
        title: 'New Conversation',
        lastMessage: '',
        timestamp: new Date(),
        messages: []
      };
      
      // Update state
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentChatId(newChatId);
      setMessages([]);
      setShowChatHistory(false);
      
      // Save to Supabase
      await chatService.createChatSession(newSession, userId);
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        description: "Failed to create a new chat session.",
        variant: "destructive"
      });
    }
  };
  
  const switchToChat = (chatId: string) => {
    const session = chatSessions.find(chat => chat.id === chatId);
    if (session) {
      setCurrentChatId(chatId);
      setMessages(session.messages);
      setShowChatHistory(false);
      
      // Make sure we update the last active timestamp on this chat
      const updatedSession = {
        ...session,
        timestamp: new Date()
      };
      
      // Update in local state
      setChatSessions(prev => prev.map(chat => 
        chat.id === chatId ? updatedSession : chat
      ));
      
      // Update in Supabase (just the timestamp)
      try {
        supabase
          .from('chat_sessions')
          .update({ timestamp: new Date().toISOString() })
          .eq('id', chatId)
          .then(() => console.log('Updated chat timestamp'))
          .catch(err => console.error('Error updating timestamp:', err));
      } catch (error) {
        console.error('Error updating chat timestamp:', error);
      }
    }
  };
  
  const handleStarChat = async (chatId: string, isStarred: boolean) => {
    try {
      // Update state
      setChatSessions(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, isStarred: !isStarred } : chat
        )
      );
      
      // Update in Supabase
      await chatService.toggleStarChatSession(chatId, !isStarred);
    } catch (error) {
      console.error('Error toggling star status:', error);
      toast({
        description: "Failed to update starred status.",
        variant: "destructive"
      });
      
      // Revert state change on error
      setChatSessions(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, isStarred: isStarred } : chat
        )
      );
    }
  };
  
  const handleDeleteChat = async (chatId: string) => {
    try {
      // Delete from Supabase
      const success = await chatService.deleteChatSession(chatId);
      
      if (success) {
        // Update state
        setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
        
        // If we deleted the current chat, switch to a new one
        if (currentChatId === chatId) {
          if (chatSessions.length > 1) {
            // Find another chat to switch to
            const anotherChat = chatSessions.find(chat => chat.id !== chatId);
            if (anotherChat) {
              setCurrentChatId(anotherChat.id);
              setMessages(anotherChat.messages);
            } else {
              startNewChat();
            }
          } else {
            startNewChat();
          }
        }
        
        setDeletingChatId(null);
        setShowChatHistory(false);
        
        toast({
          description: "Chat deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        description: "Failed to delete the chat.",
        variant: "destructive"
      });
      setDeletingChatId(null);
    }
  };
  
  const startEditingMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };
  
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };
  
  const saveEditedMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    // Find the index of the message being edited
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const editedMessage = messages[messageIndex];

    // If it's a user message, we need to regenerate the response
    if (editedMessage.role === 'user') {
      // Update the user message and remove all subsequent messages
      const messagesUpToEdited = messages.slice(0, messageIndex);
      const updatedUserMessage = { ...editedMessage, content: editContent.trim() };
      const newMessages = [...messagesUpToEdited, updatedUserMessage];

      setMessages(newMessages);

      // Reset editing state
      cancelEditing();

      // Check if user can send this message (for rate limiting)
      if (!canSendMessage()) {
        setShowLoginPrompt(true);
        return;
      }

      // Generate new response for the edited question
      setIsAddingNewMessage(true);
      setIsThinking(true);
      setIsStreaming(true);

      // Create a unique ID for the new response message
      const tempId = (Date.now() + 1).toString();

      // Add loading message for the new response
      const loadingMessage: Message = {
        id: tempId,
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
      };

      const messagesWithLoading = [...newMessages, loadingMessage];
      setMessages(messagesWithLoading);

      let streamedContent = '';
      let streamingStopped = false;

      try {
        await geminiService.generateResponse(
          newMessages.map(msg => ({ role: msg.role, content: msg.content })),
          (token) => {
            if (streamingStopped) return;

            // Hide thinking animation on first token
            if (streamedContent === '') {
              setIsThinking(false);
            }

            // Accumulate streamed content
            streamedContent += token;

            // Update messages immediately for smooth streaming
            setMessages(currentMessages => {
              const updatedMessages = [...currentMessages];
              const loadingMessageIndex = updatedMessages.findIndex(msg => msg.id === tempId);
              if (loadingMessageIndex !== -1) {
                updatedMessages[loadingMessageIndex] = {
                  ...updatedMessages[loadingMessageIndex],
                  content: streamedContent
                };
              }
              return updatedMessages;
            });
          }
        );
        streamingStopped = true;
        setIsThinking(false);
        setIsStreaming(false);
        setIsAddingNewMessage(false);

        // After streaming is complete, finalize the message
        const finalAiResponse: Message = {
          id: tempId,
          role: 'assistant' as const,
          content: streamedContent,
          timestamp: new Date(),
        };
        const finalMessages = [...newMessages, finalAiResponse];
        setMessages(finalMessages);
        updateChatSession(finalMessages);
      } catch (error) {
        streamingStopped = true;
        setIsThinking(false);
        setIsStreaming(false);
        setIsAddingNewMessage(false);
        console.error('Error generating response for edited message:', error);

        // Remove the loading message on error
        setMessages(newMessages);
        updateChatSession(newMessages);
      }
    } else {
      // For assistant messages, just update the content (existing behavior)
      const updatedMessages = messages.map(msg =>
        msg.id === messageId
          ? { ...msg, content: editContent.trim() }
          : msg
      );

      setMessages(updatedMessages);
      await updateChatSession(updatedMessages);
      cancelEditing();
    }
  };
  
  const deleteMessage = async (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    await updateChatSession(updatedMessages);
  };
  
  // Add suggestion topics with emojis
  const suggestionTopics = [
    { icon: <Leaf className="text-green-500" size={14} />, text: "Best fertilizer for wheat" },
    { icon: <Droplets className="text-blue-500" size={14} />, text: "How to grow snake plant" },
    { icon: <Bug className="text-amber-500" size={14} />, text: "Common pests in tomato plants" },
    { icon: <Check className="text-green-400" size={14} />, text: "Organic farming techniques" },
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
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  const recentChats = filteredChatSessions.filter(chat => !chat.isStarred)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Manually trigger resize for pasted content or rapid typing
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height (with a minimum of 64px)
      const newHeight = Math.max(64, Math.min(textareaRef.current.scrollHeight, 240));
      
      // Set the new height
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Submit form on Enter (without Shift)
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow Shift+Enter for new lines
      // The default behavior will add a new line
      
      // Manually trigger resize after new line is added
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          const newHeight = Math.max(64, Math.min(textareaRef.current.scrollHeight, 240));
          textareaRef.current.style.height = `${newHeight}px`;
        }
      }, 0);
    }
  };

  const handleMicClick = () => {
    // This would be implemented to handle audio recording
    // For now, we'll just toggle the recording state for UI feedback
    setIsRecording(!isRecording);
    
    // In a real implementation, you would:
    // 1. Request microphone permissions
    // 2. Start/stop recording
    // 3. Process the audio (e.g., send to a speech-to-text API)
    // 4. Set the resulting text in the input field
    
    // Simulate ending recording after 2 seconds
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        // In a real implementation, you would set the transcribed text here
        // setInput("Transcribed text would appear here");
      }, 2000);
    }
  };

  const renderFormattedContent = (content: string) => {
    // Process special sections to enhance with visualization components
    const detectAndRenderSpecialContent = () => {
      // Check if content contains information about fertilizers
      if (content.includes("fertilizer") || content.includes("Nutrient")) {
        // Extract information about nutrients if present
        const hasPrimaryNutrients = content.includes("Primary Nutrients") || 
                                   content.includes("Nitrogen") ||
                                   content.includes("Phosphorus") ||
                                   content.includes("Potassium");
                                   
        if (hasPrimaryNutrients) {
          return (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold my-4 border-b pb-2 border-gray-700" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold my-3 text-green-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold my-2 text-blue-400" {...props} />,
                  p: ({node, ...props}) => <p className="my-2" {...props} />,
                }}
              >
                {content.split("Primary Nutrients")[0]}
              </ReactMarkdown>
              
              <CollapsibleSection title="🌱 Primary Nutrients for Wheat" defaultOpen={true}>
                <div className="space-y-2">
                  <NutrientComponent 
                    name="Nitrogen (N)" 
                    value="100-120 kg/ha" 
                    description="Promotes leaf and stem development, critical for yield." 
                  />
                  <NutrientComponent 
                    name="Phosphorus (P)" 
                    value="50-60 kg/ha" 
                    description="Essential for root development and early growth." 
                  />
                  <NutrientComponent 
                    name="Potassium (K)" 
                    value="40-60 kg/ha" 
                    description="Improves disease resistance and grain filling." 
                  />
                </div>
              </CollapsibleSection>
              
              <InfoCard title="Recommended Fertilizer Combination" icon={<Check size={18} />}>
                <DataTable 
                  headers={["Fertilizer", "Application Rate", "Timing"]}
                  rows={[
                    ["Urea (46% N)", "100-120 kg", "Split application"],
                    ["DAP (18% N, 46% P)", "125 kg", "Pre-sowing"],
                    ["MOP (60% K₂O)", "50-60 kg", "Pre-sowing"]
                  ]}
                />
              </InfoCard>

              <CollapsibleSection title="📅 Application Timing">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">Base Dose (Before Sowing):</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Full DAP + MOP</li>
                      <li>25-30% of Urea</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">First Top Dressing (20-25 days after sowing):</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>30-40% Urea</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">Second Top Dressing (45-50 days after sowing):</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Remaining Urea</li>
                    </ul>
                  </div>
                </div>
              </CollapsibleSection>

              <InfoCard title="Optional Add-ons" icon={<Leaf size={18} />}>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Zinc Sulfate (ZnSO₄): 25 kg/ha if zinc deficient</li>
                  <li>Sulphur: 20-25 kg/ha if not included in fertilizer mix</li>
                </ul>
              </InfoCard>

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="my-2" {...props} />,
                }}
              >
                {content.includes("If you're doing organic farming") ? 
                  content.split("If you're doing organic farming")[1] : 
                  "If you're doing organic farming, well-rotted compost, vermicompost, and biofertilizers like Azotobacter and PSB (Phosphate Solubilizing Bacteria) work well."}
              </ReactMarkdown>
            </>
          );
        }
      }
      
      // Check if content is about growing plants
      if (content.includes("how to grow") || content.includes("plant care")) {
        return (
          <>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold my-4 border-b pb-2 border-gray-700" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold my-3 text-green-400" {...props} />,
                p: ({node, ...props}) => <p className="my-2" {...props} />,
              }}
            >
              {content.split("They thrive in")[0]}
            </ReactMarkdown>
            
            <InfoCard title="Optimal Growing Conditions" icon={<Droplets size={18} />}>
              <div className="space-y-3">
                <ProgressBar value={30} label="Light Requirements" color="bg-yellow-500" />
                <ProgressBar value={20} label="Water Needs" color="bg-blue-500" />
                <ProgressBar value={60} label="Temperature Range" color="bg-red-500" />
                <ProgressBar value={40} label="Humidity Preference" color="bg-purple-500" />
              </div>
            </InfoCard>
            
            <CollapsibleSection title="🌱 Care Guide" defaultOpen={true}>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-400 mb-1">Watering:</h4>
                  <p>Water less frequently to avoid root rot. Let soil dry between waterings.</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-400 mb-1">Light:</h4>
                  <p>Thrives in indirect sunlight but can tolerate low light conditions.</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-400 mb-1">Soil:</h4>
                  <p>Use well-draining potting mix formulated for succulents.</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-400 mb-1">Feeding:</h4>
                  <p>Light feeders - fertilize sparingly during growing season.</p>
                </div>
              </div>
            </CollapsibleSection>
            
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="my-2" {...props} />,
              }}
            >
              {content.includes("Potting Mix") ? 
                content.split("Potting Mix")[1] : 
                "Use a high-quality potting mix with good drainage to prevent root rot issues."}
            </ReactMarkdown>
          </>
        );
      }
      
      // Default rendering for other content types
      return (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold my-4 border-b pb-2 border-gray-700" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold my-3 text-green-400" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-md font-bold my-2 text-blue-400" {...props} />,
            ul: ({node, ...props}) => <ul className="my-4 space-y-3" {...props} />,
            ol: ({node, ...props}) => <ol className="my-4 space-y-3 list-decimal pl-6" {...props} />,
            li: ({node, children, ...props}) => {
              // Special formatting for list items
              if (String(children).includes("Primary Nutrients") || 
                  String(children).includes("Recommended Fertilizer") || 
                  String(children).includes("Application Timing") ||
                  String(children).includes("Optional Add-ons")) {
                return <li className="font-semibold text-green-400 my-3" {...props}>{children}</li>;
              }
              
              return (
                <li className="flex items-start" {...props}>
                  <span className="mr-2 mt-1 text-green-400">•</span>
                  <span>{children}</span>
                </li>
              );
            },
            p: ({node, ...props}) => <p className="my-3 text-justify leading-relaxed" style={{ lineHeight: "1.5" }} {...props} />,
            a: ({node, ...props}) => <a className="text-blue-400 hover:underline font-medium" {...props} />,
            code: ({node, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <div className="bg-gray-800 rounded-md my-2 overflow-hidden">
                  <div className="bg-gray-700 px-4 py-1 text-xs font-semibold text-gray-300">{match[1]}</div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-sm" {...props}>{children}</code>
                  </pre>
                </div>
              ) : (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
              );
            },
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-500 pl-4 my-5 italic bg-opacity-20 bg-green-900 py-3 pr-3 rounded-r text-justify" style={{ lineHeight: "1.5" }} {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-green-300" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full" {...props} /></div>,
                th: ({node, ...props}) => <th className="py-2 px-4 bg-[#1A2030] text-left font-medium" {...props} />,
                td: ({node, ...props}) => <td className="py-2 px-4 border-t border-[#2A3143]" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      );
    };
    
    return detectAndRenderSpecialContent();
  };
  
  // Helper components for enhanced visualization
  const InfoCard = ({ title, children, icon }: { title: string, children: React.ReactNode, icon?: React.ReactNode }) => (
    <div className="bg-[#131725] border border-[#2A3143] rounded-lg p-5 my-5 shadow-md">
      <div className="flex items-center mb-3">
        <div className="mr-2 text-green-400">{icon || <Info size={18} />}</div>
        <h3 className="font-semibold text-green-400">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );

  const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div className="border border-[#2A3143] rounded-lg my-5">
        <button 
          className="w-full flex items-center justify-between bg-[#1E2735] p-4 rounded-t-lg hover:bg-[#262F3F] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="font-semibold text-white">{title}</h3>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen && (
          <div className="p-4 bg-[#131725] rounded-b-lg">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ProgressBar = ({ value, label, color = "bg-green-500" }: { value: number, label: string, color?: string }) => (
    <div className="my-3">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{value}%</span>
      </div>
      <div className="w-full bg-[#1E2735] rounded-full h-3">
        <div 
          className={`${color} h-3 rounded-full`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  const DataTable = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
    <div className="overflow-x-auto my-5">
      <table className="min-w-full bg-[#131725] border border-[#2A3143] rounded-lg shadow-sm">
        <thead>
          <tr className="bg-[#1E2735]">
            {headers.map((header, index) => (
              <th key={index} className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-[#131725]' : 'bg-[#161E2F]'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-4 text-sm border-t border-[#2A3143]/30">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const NutrientComponent = ({ name, value, description }: { name: string, value: string, description: string }) => (
    <div className="flex items-start space-x-3 my-4">
      <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">{name.charAt(0)}</span>
      </div>
      <div>
        <div className="flex items-baseline mb-1">
          <span className="font-semibold text-green-400">{name}</span>
          <span className="ml-2 text-sm text-gray-300">({value})</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed" style={{ lineHeight: "1.5" }}>{description}</p>
      </div>
    </div>
  );

  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectChat = (chatId: string) => {
    const newSelectedChatIds = new Set(selectedChatIds);
    
    if (newSelectedChatIds.has(chatId)) {
      newSelectedChatIds.delete(chatId);
    } else {
      newSelectedChatIds.add(chatId);
    }
    
    setSelectedChatIds(newSelectedChatIds);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedChatIds(new Set());
    } else {
      const allChatIds = new Set(chatSessions.map(chat => chat.id));
      setSelectedChatIds(allChatIds);
    }
    
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    try {
      // Convert to array and sort by timestamp (descending)
      const chatsToDelete = Array.from(selectedChatIds)
        .map(id => chatSessions.find(chat => chat.id === id))
        .filter((chat): chat is ChatSession => chat !== undefined)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      for (const chat of chatsToDelete) {
        await chatService.deleteChatSession(chat.id);
      }
      
      // Update state
      setChatSessions(prev => prev.filter(chat => !selectedChatIds.has(chat.id)));
      setSelectedChatIds(new Set());
      setSelectAll(false);
      
      toast({
        description: "Selected chats deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting chats:', error);
      toast({
        description: "Failed to delete selected chats.",
        variant: "destructive"
      });
    }
  };

  // Update DialogContent for chat history with checkboxes and bulk actions
  const DialogContentWithBulkActions = () => (
    <DialogContent
      className={`${isMobile ? 'max-w-[95vw] h-[80vh]' : 'sm:max-w-[500px]'} bg-[#10141E] border-[#2A3143]`}
      onPointerDownOutside={() => setShowChatHistory(false)} // Explicitly handle outside clicks
    >
      <DialogHeader>
        <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>Chat History</DialogTitle>
        {!isMobile && (
          <DialogDescription>
            View and manage your previous conversations
          </DialogDescription>
        )}
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
      
      <div className="flex items-center justify-between mb-4">
        <Button 
          onClick={startNewChat}
          disabled={messages.length === 0}
          className={`mr-2 ${messages.length === 0 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-500 hover:bg-green-600'}`}
        >
          New Chat
        </Button>
        
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="mr-2"
          >
            {selectAll ? 'Deselect All' : 'Select All'}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={selectedChatIds.size === 0}
          >
            Delete Selected
          </Button>
        </div>
      </div>
      
      <ScrollArea className={`${isMobile ? 'h-[50vh]' : 'h-[400px]'} pr-4`}>
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
                      onClick={e => {
                        e.stopPropagation();
                        handleStarChat(chat.id, chat.isStarred);
                      }}
                      title="Unpin"
                    >
                      <Star size={14} fill="currentColor" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-[#2A3143] text-gray-400 hover:text-red-400"
                      onClick={(e) => setDeletingChatId(chat.id)}
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
                      onClick={e => {
                        e.stopPropagation();
                        handleStarChat(chat.id, chat.isStarred);
                      }}
                      title="Pin"
                    >
                      <Star size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-[#2A3143] text-gray-400 hover:text-red-400"
                      onClick={(e) => setDeletingChatId(chat.id)}
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
        ) : !searchQuery && chatSessions.length <= 1 ? (
          <div className="text-center py-6 text-gray-400">
            No previous conversations yet
          </div>
        ) : null}
      </ScrollArea>
    </DialogContent>
  );

  // Add scroll detection for showing/hiding scroll-to-top button
  useEffect(() => {
    if (!isMobile) return;
    
    const chatContainer = document.querySelector('.mobile-chat-container');
    if (!chatContainer) return;
    
    const handleScroll = () => {
      if (chatContainer.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    chatContainer.addEventListener('scroll', handleScroll);
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);
  
  // Function to scroll to top of chat
  const scrollToTop = () => {
    if (chatContainerRef.current) {
      // Force scroll to absolute top
      chatContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Also try setting scrollTop directly as a fallback
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0;
        }
      }, 300);
    }
  };

  return (
    <div className={`flex flex-col chat-page-container ${isMobile ? 'h-[100svh] min-h-[400px] overflow-hidden mobile-scrollbar-none scrollbar-hide' : 'h-screen scrollbar-hide'}`}>
      {/* Header - Only show on desktop, mobile uses AppLayout header */}
      {!isMobile && (
        <div className="sticky top-0 z-40 p-4 flex justify-between items-center shadow-sm bg-[#1E2735] border-b border-cropsay-grayDark/30">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors"
              >
                <Home size={16} />
              </button>
              <ChevronRight size={14} />
              <span className="text-white font-medium">Chat</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
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
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chat History</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={messages.length === 0}
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
      )}

      {/* Mobile Header - Fixed below app header with responsive positioning */}
      {isMobile && (
        <div
          className="fixed left-0 right-0 z-30 py-1.5 px-2 flex justify-between items-center shadow-sm border-b border-cropsay-grayDark/30 backdrop-blur-md bg-[#1E2735]/75 mobile-chat-header-responsive"
          style={{ top: isSmallMobile ? "48px" : "60px" }} // Exact positioning to eliminate gap
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors"
              >
                <Home size={16} />
              </button>
              <ChevronRight size={12} />
              <span className="text-white font-medium">Chat</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChatHistory(true)}
                      className="relative h-8 w-8"
                      data-history-toggle
                    >
                      <History size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chat History</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={messages.length === 0}
                    onClick={startNewChat}
                  >
                    <MessageSquare size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Quota Exhaustion Banner */}
      {quotaExhausted && (
        <div className="bg-amber-600/20 border border-amber-600/30 rounded-lg p-3 mx-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0"></div>
            <div className="text-sm">
              <p className="font-medium text-amber-200">Daily Usage Limit Reached</p>
              <p className="text-amber-300 text-xs mt-1">
                Our AI service has reached its daily quota. Please try again tomorrow or contact support for immediate assistance.
              </p>
            </div>
            <button 
              onClick={() => setQuotaExhausted(false)}
              className="ml-auto text-amber-400 hover:text-amber-200 transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area - with responsive padding top to account for fixed header */}
      <div
        ref={chatContainerRef}
        className={`flex-1 ${isMobile ? 'overflow-y-auto mobile-chat-main-responsive pb-[85px] mobile-chat-container scrollbar-hide' : 'overflow-y-auto scrollbar-hide'} ${isMobile ? 'py-0' : 'py-6'} bg-[#1E2735] ${isMobile ? 'flex flex-col' : ''}`}
        style={{
          scrollBehavior: 'smooth',
          overflowAnchor: 'none',
          ...(isMobile && {
            paddingTop: isSmallMobile ? '90px' : '105px' // Account for fixed header height
          })
        }}
      >
        {loading ? (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading your conversations...</p>
          </div>
        ) : messages.length === 0 ? (
          <>
            {/* Desktop version - Improved sticky design */}
            {!isMobile && (
              <div className="h-full flex flex-col">
                {/* Sticky header section */}
                <div className="sticky top-0 z-40 bg-gradient-to-b from-[#1E2735] via-[#1E2735] to-[#1E2735]/95 backdrop-blur-sm border-b border-[#2A3143]/30">
                  <div className="text-center py-8">
                    <h2 className="text-4xl mb-2 font-bold bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                      What do you want to know?
                    </h2>
                    <p className="text-gray-400 text-sm">Choose a topic below or ask your own question</p>
                  </div>
                </div>

                {/* Fixed suggestion cards - non-scrollable */}
                <div className="flex-1 flex items-center justify-center px-8">
                  <div className="max-w-4xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestionTopics.map((topic, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer group hover:bg-gradient-to-r hover:from-[#2A3143] hover:to-[#1E2735] transition-all duration-300 bg-[#1E2735] border-[#2A3143] hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transform hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => setInput(topic.text)}
                        >
                          <CardContent className="py-6 px-6 flex items-center space-x-4">
                            <div className="flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-[#2A3143] to-[#1E2735] group-hover:from-green-500/20 group-hover:to-green-600/10 transition-all duration-300">
                              {topic.icon}
                            </div>
                            <span className="text-base font-medium text-white group-hover:text-green-100 transition-colors duration-300">{topic.text}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mobile version - Compact responsive design */}
            {isMobile && (
              <div className="fixed inset-0 top-[80px] bottom-[120px] flex flex-col overflow-hidden">
                {/* Content container - centered layout */}
                <div className="flex-1 flex flex-col justify-center px-3 overflow-hidden">
                  <div className="w-full max-w-sm mx-auto">
                    {/* Header text positioned just above cards */}
                    <div className="text-center mb-4">
                      <h2 className="text-xl mb-1 font-bold bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                        What do you want to know?
                      </h2>
                      <p className="text-gray-400 text-xs">Choose a topic below or ask your own question</p>
                    </div>

                    {/* Suggestion cards */}
                    <div className="space-y-2">
                      {suggestionTopics.map((topic, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer group hover:bg-gradient-to-r hover:from-[#2A3143] hover:to-[#1E2735] transition-all duration-300 bg-[#1E2735] border-[#2A3143] hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transform hover:scale-[1.01] active:scale-[0.98]"
                          onClick={() => setInput(topic.text)}
                        >
                          <CardContent className="py-2.5 px-3 flex items-center space-x-3">
                            <div className="flex-shrink-0 p-1.5 rounded-full bg-gradient-to-br from-[#2A3143] to-[#1E2735] group-hover:from-green-500/20 group-hover:to-green-600/10 transition-all duration-300">
                              <div className="w-4 h-4 flex items-center justify-center">
                                {topic.icon}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-white group-hover:text-green-100 transition-colors duration-300 leading-tight">{topic.text}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`${isMobile ? 'pb-24 px-2 mobile-scrollbar-none scrollbar-hide mobile-chat-scroll-container' : 'pb-4 scrollbar-hide'} ${isMobile ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
            {messages.map((message, index) => (
              <div key={message.id} className={`${isMobile ? 'mb-2' : 'mb-6'} group/message ${index === 0 && isMobile ? 'mt-4' : ''}`}>
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
                  <div>
                    {/* Assistant message */}
                    {message.role === 'assistant' && (
                      <div className={`${isMobile ? 'px-2 py-1' : 'px-4 md:px-8 lg:px-10 py-4'} border-b border-[#2A3143]/20`}>
                        <div className={`prose prose-invert max-w-[95%] text-cropsay-lightText ${isMobile ? 'ml-1' : 'ml-8'}`}>
                          {message.id === messages[messages.length - 1].id && (isStreaming || isThinking) ? (
                            <ChatTextGenerateEffect key={message.content} text={message.content} isStreaming={isStreaming} isThinking={isThinking} />
                          ) : (
                            <div className="text-justify leading-7">{renderFormattedContent(message.content)
}</div>
                          )}
                        </div>
                        
                        {/* ChatGPT-style icon buttons for assistant messages */}
                        <div className={`flex items-center ${isMobile ? 'mt-1 gap-1' : 'mt-2 gap-2'}`}>
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
                      <div className={`relative group ${isMobile ? 'px-2 py-1' : 'px-4 md:px-8 lg:px-10 py-4'} flex flex-col items-end`}>
                        <div className={`${isMobile ? 'max-w-[95%] p-2' : 'max-w-[90%] p-4'} bg-[#131725] rounded-2xl text-white`}>
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                        
                        {/* Hover actions for user messages */}
                        <div className="absolute bottom-0 right-4 md:right-8 lg:right-10 hidden group-hover:flex gap-1 bg-[#1E2735] p-1 rounded-md shadow-md z-10 mb-[-30px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      
      {/* Chat Input + Pause/Resume Button */}
      <div className={`${isMobile ? 'fixed bottom-[75px] left-0 right-0 z-30 p-2 mobile-chat-input' : 'sticky bottom-0 w-full py-5 bg-gradient-to-b from-[#1E2735]/80 to-[#1E2735] backdrop-blur-sm border-t border-[#2A3143]/30'}`}>
        <div className={`${isMobile ? 'max-w-full mx-2.5' : 'max-w-4xl px-6 md:px-12 lg:px-16'} mx-auto`}>
          <form onSubmit={handleSubmit} className="relative flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={quotaExhausted ? "Daily usage limit reached - try again tomorrow" : "Ask anything..."}
              disabled={quotaExhausted || isStreaming}
              className={`flex-1 py-4 px-4 bg-[#10141E] border border-[#2A3143] focus:border-green-500 focus:ring-2 focus:ring-green-600/30 rounded-2xl text-white resize-none shadow-md transition-all duration-200 ${isMobile ? 'h-10' : 'h-12'} max-h-[200px] overflow-y-auto flex items-center`}
              style={{
                minHeight: isMobile ? '42px' : '64px',
                maxHeight: isMobile ? '80px' : '200px',
                lineHeight: isMobile ? '1.2' : '1.5',
                borderWidth: '2px',
              }}
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                type="submit"
                className={`p-2 rounded-full transition-all ${input.trim() && canSendMessage() && !isStreaming ? 'text-white bg-green-600 hover:bg-green-500' : 'text-gray-500 bg-gray-700 cursor-not-allowed opacity-50'}`}
                disabled={!input.trim() || !canSendMessage() || isStreaming}
                title="Send message"
              >
                <Send size={isMobile ? 18 : 20} className="opacity-90" />
              </button>
            </div>
  {/* Send/Pause/Resume button logic */}
          </form>
        </div>
      </div>

      {/* Mobile Scroll to Top Button */}
      {isMobile && showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed right-3 bottom-[180px] z-30 p-2 rounded-full bg-green-600/90 text-white shadow-lg"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Chat History Dialog */}
      {user && (
        <Dialog 
          open={showChatHistory} 
          onOpenChange={(open) => {
            setShowChatHistory(open);
            if (!open) {
              // When closing, clear search
              setSearchQuery('');
            }
          }}
          modal={false} // Allow closing when clicking outside
        >
          {DialogContentWithBulkActions()}
        </Dialog>
      )}

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
            <AlertDialogAction onClick={() => handleDeleteChat(deletingChatId!)} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Login Prompt Dialog */}
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to continue chatting with Cropsay AI Assistant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/auth')}>
              Login to Chat More
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatPage;

