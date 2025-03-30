import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ArrowDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    intent?: string;
    actionType?: 'profile_update' | 'workout_plan' | 'nutrition_plan' | 'info';
    actionRequired?: boolean;
    extractedData?: any;
  };
}

interface AITrainerChatProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: (profile: any) => void;
  onWorkoutPlanUpdate?: (plan: any) => void;
}

export default function AITrainerChat({ 
  userId, 
  isOpen, 
  onClose,
  onProfileUpdate,
  onWorkoutPlanUpdate
}: AITrainerChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chat with a welcome message
  useEffect(() => {
    let isMounted = true;
    
    if (messages.length === 0 && isOpen) {
      const initialMessage: Message = {
        id: 'initial-1',
        role: 'assistant',
        content: `# Welcome to your AI Fitness Trainer!

I'm here to help you achieve your fitness goals. I can:

- Design personalized workout plans based on your goals
- Provide nutrition advice tailored to your needs
- Track your progress and adjust recommendations
- Answer any fitness-related questions you have

Let's start by getting to know you better. What are your main fitness goals?`,
        timestamp: new Date(),
      };
      
      if (isMounted) {
        setMessages([initialMessage]);
      }
    }
    
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      // Show typing indicator immediately
      const tempId = `typing-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: tempId,
        role: 'assistant',
        content: '...',
        timestamp: new Date(),
        metadata: { intent: 'typing' }
      }]);
      
      // Call AI API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: currentMessage,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== tempId));
      
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        metadata: data.metadata || {}
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Handle any actions required from the AI's response
      if (aiMessage.metadata?.actionRequired && aiMessage.metadata?.actionType) {
        handleAIAction(aiMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== `typing-${Date.now()}`));
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
      
      toast({
        title: 'Error',
        description: 'Failed to communicate with the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIAction = (message: Message) => {
    if (!message.metadata) return;
    
    const { actionType, extractedData } = message.metadata;
    
    switch (actionType) {
      case 'profile_update':
        if (onProfileUpdate && extractedData) {
          onProfileUpdate(extractedData);
          toast({
            title: 'Profile Updated',
            description: 'Your fitness profile has been updated based on your conversation.',
          });
        }
        break;
        
      case 'workout_plan':
        if (onWorkoutPlanUpdate && extractedData) {
          onWorkoutPlanUpdate(extractedData);
          toast({
            title: 'Workout Plan Created',
            description: 'A new workout plan has been created for you.',
          });
        }
        break;
        
      default:
        // No action needed
        break;
    }
  };

  // Check if a message is a typing indicator
  const isTypingIndicator = (message: Message) => 
    message.metadata?.intent === 'typing';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-2xl h-[80vh] bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl overflow-hidden flex flex-col shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
              <div className="flex items-center">
                <Bot className="h-6 w-6 text-cyan-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Your AI Fitness Trainer</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.role === 'system'
                          ? 'bg-red-600/70 text-white'
                          : 'bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === 'user' ? (
                        <>
                          <span className="text-xs text-blue-200">You</span>
                          <User className="h-4 w-4 ml-1 text-blue-200" />
                        </>
                      ) : message.role === 'system' ? (
                        <span className="text-xs text-red-200">System</span>
                      ) : (
                        <>
                          <span className="text-xs text-cyan-300">AI Trainer</span>
                          <Bot className="h-4 w-4 ml-1 text-cyan-300" />
                        </>
                      )}
                    </div>
                    
                    {isTypingIndicator(message) ? (
                      <div className="flex space-x-1 items-center py-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-cyan-300 prose-a:text-cyan-300">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {!isTypingIndicator(message) &&
                        message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* New Message Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask your AI trainer anything..."
                  className="flex-grow bg-white/5 text-white rounded-l-lg px-4 py-3 focus:outline-none border border-white/10"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={!currentMessage.trim() || isProcessing}
                  className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-r-lg px-4 py-3 ${
                    !currentMessage.trim() || isProcessing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-cyan-600 hover:to-blue-600'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
            
            {/* Scroll to Bottom Button */}
            {messages.length > 4 && (
              <motion.button
                className="absolute bottom-20 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg"
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ArrowDown className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}