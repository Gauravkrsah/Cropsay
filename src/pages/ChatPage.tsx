import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, History, X, User, Trash2, Edit, Star, MessageSquare, BookOpen, ShoppingBag, Users, Search, Check, Leaf, Droplets, Bug, ChevronDown, ChevronUp, Info, BarChart } from 'lucide-react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const [userId, setUserId] = useState<string>(getUserId()); // Get persistent user ID
  const [serviceInitialized, setServiceInitialized] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { user } = useAuth(); // Get authentication state
  const navigate = useNavigate();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  useEffect(() => {
    // If user is null (logged out) and we had a previous session, reset to a new chat
    if (!user && messages.length > 0) {
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
  }, [user]);
  
  // Load chat sessions from Supabase when component mounts and service is initialized
  useEffect(() => {
    if (!serviceInitialized) return;
    
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
        
        // Only load sessions from database if user is logged in
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

  // Check if user can send message (logged in users can send unlimited, non-logged in only one)
  const canSendMessage = () => {
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
    
    // Check if user can send this message
    if (!canSendMessage()) {
      setShowLoginPrompt(true);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    
    try {
      // Show a loading state
      const tempId = (Date.now() + 1).toString();
      const loadingMessage: Message = {
        id: tempId,
        role: 'assistant' as const,
        content: '...',
        timestamp: new Date(),
      };
      
      setMessages([...newMessages, loadingMessage]);
      
      // Generate response using Gemini API
      const response = await geminiService.generateResponse(
        newMessages.map(msg => ({ role: msg.role, content: msg.content }))
      );
      
      // Update with the actual response
      const aiResponse: Message = {
        id: tempId,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date(),
      };
      
      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      
      // Update the current chat session
      updateChatSession(updatedMessages);
      
      // Show login prompt for non-logged in users after they've received a response
      if (!user) {
        setTimeout(() => {
          setShowLoginPrompt(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      toast({
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
      
      // Remove the loading message if there was an error
      setMessages(newMessages);
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
    // Update the message in the current messages array
    const updatedMessages = messages.map(msg => 
      msg.id === messageId
        ? { ...msg, content: editContent }
        : msg
    );
    
    setMessages(updatedMessages);
    
    // Also update the message in the chat session and Supabase
    await updateChatSession(updatedMessages);
    
    // Reset editing state
    cancelEditing();
  };
  
  const deleteMessage = async (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    await updateChatSession(updatedMessages);
  };
  
  // Add suggestion topics with emojis
  const suggestionTopics = [
    { icon: <Leaf className="text-green-500" />, text: "Best fertilizer for wheat" },
    { icon: <Droplets className="text-blue-500" />, text: "How to grow snake plant" },
    { icon: <Bug className="text-amber-500" />, text: "Common pests in tomato plants" },
    { icon: <Check className="text-green-400" />, text: "Organic farming techniques" },
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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
            ul: ({node, ...props}) => <ul className="my-3 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="my-3 space-y-2 list-decimal pl-6" {...props} />,
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
            p: ({node, ...props}) => <p className="my-2" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
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
                <code className="bg-gray-800 px-1 rounded text-sm" {...props}>{children}</code>
              );
            },
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-500 pl-4 my-4 italic bg-opacity-20 bg-green-900 py-2 pr-2 rounded-r" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-green-300" {...props} />
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
    <div className="bg-[#131725] border border-[#2A3143] rounded-lg p-4 my-4 shadow-md">
      <div className="flex items-center mb-2">
        <div className="mr-2 text-green-400">{icon || <Info size={18} />}</div>
        <h3 className="font-semibold text-green-400">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );

  const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div className="border border-[#2A3143] rounded-lg my-4">
        <button 
          className="w-full flex items-center justify-between bg-[#1E2735] p-3 rounded-t-lg hover:bg-[#262F3F] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="font-semibold text-white">{title}</h3>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen && (
          <div className="p-3 bg-[#131725] rounded-b-lg">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ProgressBar = ({ value, label, color = "bg-green-500" }: { value: number, label: string, color?: string }) => (
    <div className="my-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{value}%</span>
      </div>
      <div className="w-full bg-[#1E2735] rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  const DataTable = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full bg-[#131725] border border-[#2A3143] rounded-lg">
        <thead>
          <tr className="bg-[#1E2735]">
            {headers.map((header, index) => (
              <th key={index} className="py-2 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-[#131725]' : 'bg-[#161E2F]'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-2 px-4 text-sm">
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
    <div className="flex items-start space-x-2 my-3">
      <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">{name.charAt(0)}</span>
      </div>
      <div>
        <div className="flex items-baseline">
          <span className="font-semibold text-green-400">{name}</span>
          <span className="ml-2 text-sm text-gray-300">({value})</span>
        </div>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 flex justify-between items-center shadow-sm bg-[#1E2735] border-b border-cropsay-grayDark/30">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold">Cropsay AI Assistant</h1>
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
          )}
          
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
        {loading ? (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading your conversations...</p>
          </div>
        ) : messages.length === 0 ? (
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
                    {/* Assistant message */}
                    {message.role === 'assistant' && (
                      <div className="max-w-[85%]">
                        <div className="flex items-start mb-1">
                          <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="white"/>
                              <path d="M22 2 11 13"></path>
                            </svg>
                          </div>
                          <div className="prose prose-invert max-w-none text-cropsay-lightText bg-[#1E2735] p-4 rounded-lg shadow-sm">
                            {renderFormattedContent(message.content)}
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
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
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
                disabled={!input.trim() || !canSendMessage()}
                className={`p-2 rounded-lg mr-2 ${
                  input.trim() && canSendMessage() ? 'text-white bg-green-600 hover:bg-green-700' : 'text-gray-500 bg-gray-700 cursor-not-allowed'
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
          <DialogContent 
            className="sm:max-w-[500px] bg-[#10141E] border-[#2A3143]"
            onPointerDownOutside={() => setShowChatHistory(false)} // Explicitly handle outside clicks
          >
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
                            onClick={(e) => handleStarChat(chat.id, chat.isStarred)}
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
                            onClick={(e) => handleStarChat(chat.id, chat.isStarred)}
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
            <AlertDialogAction onClick={() => navigate('/login')}>
              Login to Chat More
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatPage;
