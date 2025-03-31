import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: any;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock user ID for testing until auth is fully implemented
const TEST_USER_ID = "user-123";

export function ImprovedAIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const userId = user?.id || TEST_USER_ID;

  // Load chat history from API
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await fetch(`/api/chat/messages?userId=${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            // Format the messages correctly
            const formattedMessages = data.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })).sort((a: any, b: any) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            setMessages(formattedMessages);
          } else {
            // No messages found, set welcome message
            setMessages([{
              id: 'welcome',
              content: "👋 **Welcome to Your AI Fitness Coach!**\n\nI'm here to help you with your fitness journey. I can provide workout tips, nutrition advice, answer fitness questions, and more. How can I assist you today?",
              role: 'assistant',
              timestamp: new Date()
            }]);
          }
        } else {
          // API error, fall back to welcome message
          console.error('Failed to fetch chat history');
          setMessages([{
            id: 'welcome',
            content: "👋 **Welcome to Your AI Fitness Coach!**\n\nI'm here to help you with your fitness journey. I can provide workout tips, nutrition advice, answer fitness questions, and more. How can I assist you today?",
            role: 'assistant',
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setMessages([{
          id: 'welcome',
          content: "👋 **Welcome to Your AI Fitness Coach!**\n\nI'm here to help you with your fitness journey. I can provide workout tips, nutrition advice, answer fitness questions, and more. How can I assist you today?",
          role: 'assistant',
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, userId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save message to database
  const saveMessageToDb = async (message: Message) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          content: message.content,
          role: message.role,
          metadata: message.metadata || null
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save message to database');
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    // Add message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    // Save user message to database
    await saveMessageToDb(userMessage);
    
    try {
      // Send to our improved AI chat API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          chatHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Create AI response message
      const aiMessage: Message = {
        id: 'ai-' + Date.now().toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      };
      
      // Save AI message to database
      await saveMessageToDb(aiMessage);
      
      // Add AI message to chat
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      });
      
      // Add error message
      const errorMessage: Message = {
        id: 'error-' + Date.now().toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      // Save error message to database
      await saveMessageToDb(errorMessage);
      
      // Add error message to chat
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">AI Fitness Coach</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={async () => {
                if (window.confirm("Are you sure you want to clear your chat history?")) {
                  try {
                    setIsLoadingHistory(true);
                    const response = await fetch(`/api/chat/messages?userId=${userId}`, {
                      method: 'DELETE'
                    });
                    
                    if (response.ok) {
                      setMessages([{
                        id: 'welcome',
                        content: "👋 **Welcome to Your AI Fitness Coach!**\n\nI'm here to help you with your fitness journey. I can provide workout tips, nutrition advice, answer fitness questions, and more. How can I assist you today?",
                        role: 'assistant',
                        timestamp: new Date()
                      }]);
                      
                      // Save the welcome message to database
                      await saveMessageToDb({
                        id: 'welcome',
                        content: "👋 **Welcome to Your AI Fitness Coach!**\n\nI'm here to help you with your fitness journey. I can provide workout tips, nutrition advice, answer fitness questions, and more. How can I assist you today?",
                        role: 'assistant',
                        timestamp: new Date()
                      });
                      
                      toast({
                        title: "Success",
                        description: "Chat history cleared successfully",
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: "Failed to clear chat history",
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    console.error('Error clearing chat history:', error);
                    toast({
                      title: "Error",
                      description: "Failed to clear chat history",
                      variant: "destructive"
                    });
                  } finally {
                    setIsLoadingHistory(false);
                  }
                }
              }}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
              title="Clear chat history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversation history...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`max-w-[85%] ${
                    message.role === 'user' 
                      ? 'ml-auto bg-blue-600 text-white rounded-t-lg rounded-bl-lg' 
                      : 'mr-auto bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-t-lg rounded-br-lg'
                  } p-3`}
                >
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className={`text-xs ${
                    message.role === 'user' 
                      ? 'text-blue-200' 
                      : 'text-gray-500'
                  } mt-1`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mr-auto bg-gray-200 dark:bg-gray-800 rounded-t-lg rounded-br-lg p-3">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your fitness coach..."
              className="flex-1 border dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputValue.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImprovedAIChat;