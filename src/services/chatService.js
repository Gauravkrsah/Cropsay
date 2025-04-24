import { supabase, ensureTablesExist, createMemoryTables, getUserId } from '@/integrations/supabase/supabaseClient';

/**
 * Chat Service
 * Handles all operations related to chat sessions and messages
 * Falls back to in-memory storage if database tables don't exist
 */
export const chatService = {
  useMemoryFallback: false,
  initialized: false,
  
  /**
   * Initialize the service and ensure required tables exist
   * @returns {Promise<boolean>} True if initialization was successful
   */
  init: async () => {
    try {
      // Don't initialize multiple times
      if (chatService.initialized) {
        console.log('Chat service already initialized');
        return true;
      }
      
      console.log('Initializing chat service...');
      
      // Try to check if tables exist in Supabase
      const tablesExist = await ensureTablesExist();
      
      if (!tablesExist) {
        // Tables don't exist, use memory fallback
        console.log('Using memory fallback for chat storage');
        chatService.useMemoryFallback = true;
        chatService.initialized = true;
        return createMemoryTables();
      }
      
      console.log('Chat service initialized with Supabase storage');
      chatService.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      
      // Use memory fallback on error
      console.log('Using memory fallback due to error');
      chatService.useMemoryFallback = true;
      chatService.initialized = true;
      return createMemoryTables();
    }
  },

  /**
   * Get all chat sessions for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Chat sessions with their messages
   */
  getChatSessions: async (userId) => {
    // Security check: Verify the user is authenticated and the userId matches the authenticated user
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If there's no active session, user is not authenticated
      // For product recommendations, we'll still allow access to chat history
      // using the localStorage ID for non-authenticated users
      if (!session) {
        console.log('No authenticated session found, using localStorage ID');
        // Continue with the request using the localStorage ID
        // This allows product recommendations to work for non-authenticated users
        // while still preventing access to other users' data
        // (since localStorage IDs are unique per browser)
        return chatService.getLocalChatSessions(userId);
      }
      
      // Ensure the requested userId matches the authenticated user's ID
      if (userId !== session.user.id) {
        console.error('Security violation: Attempted to access chat history of another user');
        throw new Error('Unauthorized access to chat history');
      }
      return chatService.getSupabaseChatSessions(userId);
    } catch (error) {
      console.error('Authentication check failed:', error);
      return [];
    }
  },
  getLocalChatSessions: async (userId) => {
      // Check if we're using memory fallback
      if (chatService.useMemoryFallback) {
        console.log('Getting chat sessions from memory');
        const sessions = window.memoryStorage.chat_sessions.filter(
          session => session.user_id === userId
        );
        
        return sessions.map(session => {
          const messages = window.memoryStorage.chat_messages.filter(
            msg => msg.chat_id === session.id
          );
          
          return {
            ...session,
            messages: messages || []
          };
        });
      }
      
      return [];
  },
  
  getSupabaseChatSessions: async (userId) => {
    try {
      console.log('Getting chat sessions from Supabase for user:', userId);
      // Use Supabase
      // First, get all chat sessions for this user
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error('Error fetching chat sessions:', error);
        throw error;
      }
      
      if (!sessions || sessions.length === 0) {
        console.log('No chat sessions found for user:', userId);
        return [];
      }
      
      console.log(`Found ${sessions.length} chat sessions`);
      
      // For each session, get its messages
      const sessionsWithMessages = await Promise.all(sessions.map(async (session) => {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', session.id)
          .order('timestamp', { ascending: true });
          
        if (messagesError) {
          console.error(`Error fetching messages for session ${session.id}:`, messagesError);
          return { ...session, messages: [] };
        }
        
        return {
          ...session,
          messages: messages || []
        };
      }));
      
      return sessionsWithMessages;
    } catch (error) {
      console.error('Error in getChatSessions:', error);
      
      // If this fails, try memory fallback
      chatService.useMemoryFallback = true;
      return chatService.getChatSessions(userId);
    }
  },
  
  /**
   * Create a new chat session
   * @param {Object} session - The chat session to create
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The created chat session
   */
  createChatSession: async (session, userId) => {
    try {
      // Make sure the service is initialized
      if (!chatService.initialized) {
        await chatService.init();
      }
      
      console.log('Creating new chat session for user:', userId);
      
      const newSession = {
        id: session.id,
        user_id: userId,
        title: session.title || 'New Chat',
        last_message: session.lastMessage || '',
        timestamp: new Date().toISOString(),
        is_starred: session.isStarred || false
      };
      
      // Check if we're using memory fallback
      if (chatService.useMemoryFallback) {
        console.log('Creating chat session in memory');
        window.memoryStorage.chat_sessions.push(newSession);
        
        // If there are messages, add them too
        if (session.messages && session.messages.length > 0) {
          const messagesToAdd = session.messages.map(msg => ({
            id: msg.id,
            chat_id: session.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp || Date.now()).toISOString()
          }));
          
          window.memoryStorage.chat_messages.push(...messagesToAdd);
        }
        
        return newSession;
      }
      
      // Use Supabase
      // First, insert the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([newSession])
        .select();
        
      if (sessionError) {
        console.error('Error creating chat session:', sessionError);
        throw sessionError;
      }
      
      // If there are messages, insert them too
      if (session.messages && session.messages.length > 0) {
        const messagesToInsert = session.messages.map(msg => ({
          id: msg.id,
          chat_id: session.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now()).toISOString()
        }));
        
        const { error: messagesError } = await supabase
          .from('chat_messages')
          .insert(messagesToInsert);
          
        if (messagesError) {
          console.error('Error inserting messages:', messagesError);
          throw messagesError;
        }
      }
      
      console.log('Chat session created successfully with ID:', session.id);
      return sessionData ? sessionData[0] : newSession;
    } catch (error) {
      console.error('Error in createChatSession:', error);
      
      // If Supabase fails, fall back to memory
      chatService.useMemoryFallback = true;
      return chatService.createChatSession(session, userId);
    }
  },
  
  /**
   * Update an existing chat session
   * @param {Object} session - The updated chat session
   * @returns {Promise<Object>} The updated chat session
   */
  updateChatSession: async (session) => {
    try {
      // Make sure the service is initialized
      if (!chatService.initialized) {
        await chatService.init();
      }
      
      console.log('Updating chat session:', session.id);
      
      const updatedSession = {
        title: session.title || 'Untitled Chat',
        last_message: session.lastMessage || '',
        timestamp: new Date().toISOString(),
        is_starred: session.isStarred || false
      };
      
      // Check if we're using memory fallback
      if (chatService.useMemoryFallback) {
        console.log('Updating chat session in memory');
        const index = window.memoryStorage.chat_sessions.findIndex(s => s.id === session.id);
        
        if (index !== -1) {
          window.memoryStorage.chat_sessions[index] = {
            ...window.memoryStorage.chat_sessions[index],
            ...updatedSession
          };
          
          return window.memoryStorage.chat_sessions[index];
        } else {
          console.error('Chat session not found in memory:', session.id);
          throw new Error('Chat session not found');
        }
      }
      
      // Use Supabase
      const { data, error } = await supabase
        .from('chat_sessions')
        .update(updatedSession)
        .eq('id', session.id)
        .select();
        
      if (error) {
        console.error('Error updating chat session:', error);
        throw error;
      }
      
      console.log('Chat session updated successfully');
      return data ? data[0] : { id: session.id, ...updatedSession };
    } catch (error) {
      console.error('Error in updateChatSession:', error);
      
      // If Supabase fails, fall back to memory
      chatService.useMemoryFallback = true;
      return chatService.updateChatSession(session);
    }
  },
  
  /**
   * Delete a chat session and all its messages
   * @param {string} sessionId - The ID of the chat session to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  deleteChatSession: async (sessionId) => {
    try {
      // Make sure the service is initialized
      if (!chatService.initialized) {
        await chatService.init();
      }
      
      console.log('Deleting chat session:', sessionId);
      
      // Check if we're using memory fallback
      if (chatService.useMemoryFallback) {
        console.log('Deleting chat session from memory');
        window.memoryStorage.chat_sessions = window.memoryStorage.chat_sessions.filter(
          session => session.id !== sessionId
        );
        
        window.memoryStorage.chat_messages = window.memoryStorage.chat_messages.filter(
          message => message.chat_id !== sessionId
        );
        
        return true;
      }
      
      // Use Supabase
      // Delete the session (messages will be cascaded due to FK constraint)
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error deleting chat session:', error);
        throw error;
      }
      
      console.log('Chat session deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteChatSession:', error);
      
      // If Supabase fails, fall back to memory
      chatService.useMemoryFallback = true;
      return chatService.deleteChatSession(sessionId);
    }
  },
  
  /**
   * Update or add messages for a chat session
   * @param {Array} messages - Array of messages to update
   * @param {string} chatId - The ID of the chat session
   * @returns {Promise<boolean>} True if update was successful
   */
  updateChatMessages: async (messages, chatId) => {
    try {
      // Make sure the service is initialized
      if (!chatService.initialized) {
        await chatService.init();
      }
      
      if (!messages || messages.length === 0) {
        console.log('No messages to update for chat', chatId);
        return true;
      }
      
      console.log(`Updating ${messages.length} messages for chat ${chatId}`);
      
      // Create message objects
      const messagesToSave = messages.map(msg => ({
        id: msg.id,
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()).toISOString()
      }));
      
      // Check if we're using memory fallback
      if (chatService.useMemoryFallback) {
        console.log('Updating messages in memory');
        
        // Remove existing messages for this chat
        window.memoryStorage.chat_messages = window.memoryStorage.chat_messages.filter(
          message => message.chat_id !== chatId
        );
        
        // Add new messages
        if (messagesToSave.length > 0) {
          window.memoryStorage.chat_messages.push(...messagesToSave);
        }
        
        return true;
      }
      
      // Use Supabase
      // Delete existing messages for this chat
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);
        
      if (deleteError) {
        console.error('Error deleting existing messages:', deleteError);
        throw deleteError;
      }
      
      // Insert new messages
      if (messagesToSave.length > 0) {
        const { error: insertError } = await supabase
          .from('chat_messages')
          .insert(messagesToSave);
          
        if (insertError) {
          console.error('Error inserting messages:', insertError);
          throw insertError;
        }
      }
      
      console.log('Messages updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateChatMessages:', error);
      
      // If Supabase fails, fall back to memory
      chatService.useMemoryFallback = true;
      return chatService.updateChatMessages(messages, chatId);
    }
  },
  
  /**
   * Toggle the starred status of a chat session
   * @param {string} sessionId - The ID of the chat session
   * @param {boolean} isStarred - The new starred status
   * @returns {Promise<boolean>} True if update was successful
   */
  toggleStarChatSession: async (sessionId, isStarred) => {
    try {
      // Make sure the service is initialized
      if (!chatService.initialized) {
        await chatService.init();
      }
      
      console.log(`${isStarred ? 'Starring' : 'Unstarring'} chat session:`, sessionId);
      
      // Check if we're using memory fallback
      if (chatService.useMemoryFallback) {
        console.log('Toggling star status in memory');
        
        const index = window.memoryStorage.chat_sessions.findIndex(s => s.id === sessionId);
        
        if (index !== -1) {
          window.memoryStorage.chat_sessions[index].is_starred = isStarred;
        } else {
          console.error('Chat session not found in memory:', sessionId);
          throw new Error('Chat session not found');
        }
        
        return true;
      }
      
      // Use Supabase
      const { error } = await supabase
        .from('chat_sessions')
        .update({ is_starred: isStarred })
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error toggling star status:', error);
        throw error;
      }
      
      console.log('Star status updated successfully');
      return true;
    } catch (error) {
      console.error('Error in toggleStarChatSession:', error);
      
      // If Supabase fails, fall back to memory
      chatService.useMemoryFallback = true;
      return chatService.toggleStarChatSession(sessionId, isStarred);
    }
  }
};
