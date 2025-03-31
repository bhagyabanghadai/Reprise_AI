import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Brain,
  Zap,
  MessageSquare,
  ArrowRight,
  Send,
  X,
  RefreshCw,
  User,
  Edit3,
  Save,
  Clipboard,
  Smile
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    intent?: string;
    extractedData?: any;
    actionRequired?: boolean;
    actionType?: 'profile_update' | 'workout_plan' | 'nutrition_plan' | 'info';
  };
}

interface InteractiveAITrainerProps {
  userId: string;
  onPlanUpdate?: (plan: any) => void;
  onProfileUpdate?: (profile: any) => void;
  initialMessage?: string;
  isEmbedded?: boolean;
}

// Set of conversation starters for fitness goals
const CONVERSATION_STARTERS = [
  "I'd like to build muscle and strength",
  "I want to lose weight and get lean",
  "I need help with a training program",
  "I'm recovering from an injury",
  "I want to improve my endurance",
  "How can I track my progress better?",
  "What should I eat to support my training?"
];

export default function InteractiveAITrainer({ 
  userId, 
  onPlanUpdate, 
  onProfileUpdate,
  initialMessage,
  isEmbedded = false
}: InteractiveAITrainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [actionPanelData, setActionPanelData] = useState<any>(null);
  const [actionType, setActionType] = useState<'profile_update' | 'workout_plan' | 'nutrition_plan' | 'info' | undefined>(undefined);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [conversationMode, setConversationMode] = useState<'chat' | 'onboarding' | 'guided'>('chat');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<any>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Onboarding questions sequence
  const onboardingQuestions = [
    "What's your primary fitness goal? (e.g., build muscle, lose weight, improve endurance)",
    "How would you describe your current fitness level? (beginner, intermediate, advanced)",
    "How many days per week can you dedicate to working out?",
    "Do you have any physical limitations or injuries I should know about?",
    "Do you have access to a gym with equipment, or will you be training at home?",
    "What's your height and weight? (This helps me tailor recommendations)",
    "What's your age? (This helps optimize recovery recommendations)"
  ];

  // Set up initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages = [{
        id: 'welcome',
        content: "👋 **Welcome to Your Interactive AI Trainer!**\n\nI'm here to help you achieve your fitness goals. I can create a personalized workout plan, nutritional guidance, and answer questions about your training.\n\n💡 **How It Works**\n• Chat with me just like a real trainer\n• I'll learn about your goals and fitness level\n• I'll create custom workout plans for you\n• Your plan will update on your dashboard\n\n**What would you like to focus on today?**",
        role: 'assistant' as const,
        timestamp: new Date()
      }];
      
      // If there's an initial message, display it as an assistant message
      if (initialMessage) {
        initialMessages.push({
          id: 'system-initial',
          content: initialMessage,
          role: 'assistant' as const, // Use assistant role for all visible messages
          timestamp: new Date()
        });
      }
      
      setMessages(initialMessages);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If in onboarding mode, send the next question
  useEffect(() => {
    // Only trigger when conversationMode or onboardingStep actually changes
    if (conversationMode !== 'onboarding') return;
    
    // Handle case for showing question
    if (onboardingStep < onboardingQuestions.length) {
      // Check to see if we already have this onboarding message in the chat
      const hasCurrentQuestion = messages.some(msg => 
        msg.id === `onboarding-${onboardingStep}`
      );
      
      // Only add the message if it's not already there
      if (!hasCurrentQuestion) {
        const systemMessage: Message = {
          id: `onboarding-${onboardingStep}`,
          content: onboardingQuestions[onboardingStep],
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    } 
    // Handle case for completing onboarding
    else if (onboardingStep >= onboardingQuestions.length) {
      // Onboarding complete, send data to backend and generate plan
      finishOnboarding();
    }
  }, [conversationMode, onboardingStep, messages, onboardingQuestions]);

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      // Prepare the profile data from onboarding
      const profileData = {
        userId,
        fitnessGoals: {
          primary: onboardingData.fitnessGoal || 'general fitness',
          secondary: []
        },
        fitnessLevel: onboardingData.fitnessLevel || 'beginner',
        daysPerWeek: parseInt(onboardingData.daysPerWeek || '3', 10),
        limitations: onboardingData.limitations || null,
        equipment: onboardingData.equipment?.includes('gym') ? ['gym'] : ['home'],
        height: onboardingData.height || null,
        weight: onboardingData.weight || null,
        age: onboardingData.age || null
      };
      
      // Send profile data to backend
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Notify about profile update
      if (onProfileUpdate) {
        onProfileUpdate(profileData);
      }
      
      // Add completion message
      setMessages(prev => [...prev, {
        id: 'onboarding-complete',
        content: "✅ **Profile Complete!**\n\nThank you for providing all that information! I've updated your profile and I'm now generating a personalized workout plan based on your goals and preferences.\n\n**Your plan will appear on your dashboard shortly.**\n\nIs there anything specific you'd like to know about your new training program?",
        role: 'assistant',
        timestamp: new Date()
      }]);
      
      // Switch back to chat mode
      setConversationMode('chat');
      
      // Request workout plan generation
      await generateWorkoutPlan(profileData);
      
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your profile data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutPlan = async (profileData: any) => {
    try {
      // Request a new workout plan based on the profile
      const response = await fetch(`/api/workout-plan?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate workout plan');
      }
      
      const data = await response.json();
      
      // Notify about plan update
      if (onPlanUpdate && data.plan) {
        onPlanUpdate(data.plan);
      }
      
      // Add plan confirmation message
      setMessages(prev => [...prev, {
        id: 'plan-generated',
        content: "🎉 **Workout Plan Generated!**\n\nI've created a personalized workout plan based on your profile. You can view it on your dashboard.\n\n**Would you like me to walk you through the plan?**",
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          actionType: 'workout_plan',
          actionRequired: false,
          extractedData: data.plan
        }
      }]);
      
    } catch (error) {
      console.error('Error generating workout plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a workout plan. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const startOnboarding = () => {
    setConversationMode('onboarding');
    setOnboardingStep(0);
    setOnboardingData({});
    
    // Add initial onboarding message
    setMessages(prev => [...prev, {
      id: 'onboarding-start',
      content: "Great! Let's create your personalized fitness profile. I'll ask you a series of questions to better understand your goals and current fitness level. This will help me create a customized plan just for you.",
      role: 'assistant',
      timestamp: new Date()
    }]);
  };

  const handleOnboardingResponse = (response: string) => {
    // Add user response to messages
    const userMessage: Message = {
      id: Date.now().toString(),
      content: response,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the response based on current step
    switch (onboardingStep) {
      case 0: // Fitness goal
        setOnboardingData((prev: any) => ({ ...prev, fitnessGoal: response }));
        break;
      case 1: // Fitness level
        setOnboardingData((prev: any) => ({ ...prev, fitnessLevel: response.toLowerCase() }));
        break;
      case 2: // Days per week
        setOnboardingData((prev: any) => ({ ...prev, daysPerWeek: response }));
        break;
      case 3: // Limitations/injuries
        setOnboardingData((prev: any) => ({ ...prev, limitations: response }));
        break;
      case 4: // Equipment access
        setOnboardingData((prev: any) => ({ ...prev, equipment: response }));
        break;
      case 5: // Height and weight
        setOnboardingData((prev: any) => ({ ...prev, heightWeight: response }));
        // Parse height and weight if possible
        const heightWeightMatch = response.match(/(\d+)['"cm\s]*.*?(\d+)[kg\s\w]*/i);
        if (heightWeightMatch) {
          setOnboardingData((prev: any) => ({ 
            ...prev, 
            height: heightWeightMatch[1], 
            weight: heightWeightMatch[2] 
          }));
        }
        break;
      case 6: // Age
        setOnboardingData((prev: any) => ({ ...prev, age: response }));
        break;
    }
    
    // Move to next question
    setOnboardingStep(prev => prev + 1);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // If in onboarding mode, handle differently
    if (conversationMode === 'onboarding') {
      handleOnboardingResponse(inputValue);
      setInputValue('');
      return;
    }
    
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
    
    try {
      // Process special commands
      if (inputValue.toLowerCase() === '/start onboarding') {
        startOnboarding();
        setLoading(false);
        return;
      }
      
      // Get user ID either from props or auth context
      const currentUserId = userId || user?.id || 'user-123';
      
      // Send to our AI chat API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: currentUserId,
          chatHistory: messages
            .filter(msg => msg.role !== 'system') // Don't send system messages
            .map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          intent: 'trainer', // Specialized intent for trainer mode
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Look for structured data in the response (JSON pattern)
      let extractedData = null;
      let actionType: 'profile_update' | 'workout_plan' | 'nutrition_plan' | 'info' | undefined = undefined;
      let actionRequired = false;
      
      // Check if the message contains a JSON structure
      const jsonMatch = data.message.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[1]);
          
          // Determine action type based on data structure
          if (extractedData.fitnessGoals || extractedData.fitnessLevel) {
            actionType = 'profile_update';
            actionRequired = true;
          } else if (extractedData.weeklyPlan) {
            actionType = 'workout_plan';
            actionRequired = true;
          } else if (extractedData.dailyCalories || extractedData.macroSplit) {
            actionType = 'nutrition_plan';
            actionRequired = true;
          }
        } catch (e) {
          console.error('Error parsing extracted data:', e);
        }
      }
      
      // Create AI response message
      const aiMessage: Message = {
        id: 'ai-' + Date.now().toString(),
        content: data.message.replace(/```json\n[\s\S]*?\n```/, ''), // Remove the JSON block
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: data.metadata?.intent,
          extractedData,
          actionRequired,
          actionType
        }
      };
      
      // Add AI message to chat
      setMessages(prev => [...prev, aiMessage]);
      
      // If action required, show action panel
      if (actionRequired && extractedData) {
        setActionPanelData(extractedData);
        setActionType(actionType);
        setShowActionPanel(true);
      }
      
      // If the AI detected profile info, update the profile
      if (actionType === 'profile_update' && onProfileUpdate) {
        onProfileUpdate(extractedData);
      }
      
      // If the AI generated a workout plan, update the plan
      if (actionType === 'workout_plan' && onPlanUpdate) {
        onPlanUpdate(extractedData);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      });
      
      // Add error message
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now().toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      }]);
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

  const handleActionApply = async () => {
    if (!actionPanelData || !actionType) return;
    
    try {
      // Handle different action types
      if (actionType === 'profile_update') {
        // Save profile data
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            ...actionPanelData
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        
        toast({
          title: 'Profile Updated',
          description: 'Your fitness profile has been updated successfully.'
        });
        
      } else if (actionType === 'workout_plan') {
        // Save workout plan to database and update dashboard
        console.log('Applying workout plan:', actionPanelData);
        
        // Call the workout plan API to save the AI-generated plan
        if (actionPanelData.weeklyPlan) {
          try {
            const response = await fetch('/api/workout-plan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userId || user?.id || 'user-123',
                plan: actionPanelData
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to save workout plan, but continuing with UI update');
            } else {
              console.log('Workout plan saved successfully');
            }
          } catch (error) {
            console.error('Error saving workout plan:', error);
            // Continue with UI updates even if save fails
          }
        }
        
        // Use the callback to update the UI
        if (onPlanUpdate) {
          onPlanUpdate(actionPanelData);
        }
        
        toast({
          title: 'Workout Plan Applied',
          description: 'Your new workout plan has been applied to your dashboard.'
        });
        
      } else if (actionType === 'nutrition_plan') {
        // Save nutrition plan
        try {
          const response = await fetch('/api/nutrition', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId || user?.id || 'user-123',
              plan: actionPanelData
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to save nutrition plan, but continuing with UI update');
          } else {
            console.log('Nutrition plan saved successfully');
          }
        } catch (error) {
          console.error('Error saving nutrition plan:', error);
          // Continue with UI updates even if save fails
        }
        
        toast({
          title: 'Nutrition Plan Saved',
          description: 'Your nutrition recommendations have been saved to your dashboard.'
        });
      }
      
      // Close the action panel
      setShowActionPanel(false);
      setActionPanelData(null);
      setActionType(undefined);
      
    } catch (error) {
      console.error('Error applying action:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply changes. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSendStarter = (starter: string) => {
    setInputValue(starter);
    sendMessage();
  };

  // Main component render
  const renderChatInterface = () => (
    <div className={`flex flex-col h-full ${isEmbedded ? 'overflow-hidden' : ''}`}>
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">AI Fitness Trainer</h2>
        </div>
        <div className="flex gap-2">
          {!isEmbedded && (
            <>
              <button
                onClick={toggleFullScreen}
                className="p-1 rounded-full hover:bg-gray-700"
              >
                {isFullScreen ? (
                  <ChevronDown className="h-5 w-5 text-gray-300" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-300" />
                )}
              </button>
              <button
                onClick={toggleMinimize}
                className="p-1 rounded-full hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {showIntro && messages.length <= 2 && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-cyan-400" />
              Quick Start Options
            </h3>
            <div className="grid grid-cols-1 gap-2 mt-3">
              {CONVERSATION_STARTERS.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleSendStarter(starter)}
                  className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-cyan-400" />
                  {starter}
                </button>
              ))}
              <button
                onClick={startOnboarding}
                className="text-left p-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-white text-sm flex items-center"
              >
                <Clipboard className="h-4 w-4 mr-2 text-white" />
                Start Full Fitness Profile Setup
              </button>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <motion.div 
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-[90%] ${
              message.role === 'user' 
                ? 'ml-auto bg-blue-600 text-white rounded-t-lg rounded-bl-lg' 
                : message.role === 'system'
                  ? 'mx-auto bg-gray-700 text-gray-300 rounded-lg italic text-sm'
                  : 'mr-auto bg-gray-800 text-white rounded-t-lg rounded-br-lg'
            } p-3 shadow-md`}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {message.role !== 'system' && (
              <div className={`text-xs ${
                message.role === 'user' 
                  ? 'text-blue-200' 
                  : 'text-gray-500'
              } mt-1`}>
                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
            
            {/* If this message has actionable data */}
            {message.metadata?.actionRequired && message.metadata?.actionType && (
              <div className="mt-3 pt-2 border-t border-gray-700">
                <button
                  onClick={() => {
                    setActionPanelData(message.metadata?.extractedData);
                    setActionType(message.metadata?.actionType as any);
                    setShowActionPanel(true);
                  }}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-xs flex items-center"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {message.metadata?.actionType === 'profile_update' && 'Update Profile'}
                  {message.metadata?.actionType === 'workout_plan' && 'Apply Workout Plan'}
                  {message.metadata?.actionType === 'nutrition_plan' && 'Save Nutrition Plan'}
                </button>
              </div>
            )}
          </motion.div>
        ))}
        
        {loading && (
          <div className="mr-auto bg-gray-800 rounded-lg p-3">
            <div className="flex space-x-2">
              <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        {conversationMode === 'onboarding' ? (
          // Simplified input for onboarding
          <div className="flex items-end gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              className="flex-1 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-700 text-white"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputValue.trim()}
              className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        ) : (
          // Regular chat input
          <div className="flex flex-col gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI trainer something..."
              className="w-full border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-700 text-white resize-none"
              rows={2}
              disabled={loading}
            />
            <div className="flex justify-between">
              <div className="flex gap-2">
                <button
                  onClick={startOnboarding}
                  className="p-2 text-xs text-cyan-300 hover:text-cyan-100 flex items-center"
                >
                  <User className="h-3 w-3 mr-1" />
                  Setup Profile
                </button>
                <button
                  onClick={() => setShowIntro(!showIntro)}
                  className="p-2 text-xs text-cyan-300 hover:text-cyan-100 flex items-center"
                >
                  <Smile className="h-3 w-3 mr-1" />
                  {showIntro ? 'Hide Suggestions' : 'Show Suggestions'}
                </button>
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !inputValue.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Action panel for extracted data
  const renderActionPanel = () => (
    <AnimatePresence>
      {showActionPanel && actionPanelData && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700 rounded-t-lg shadow-lg z-10"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              {actionType === 'profile_update' && (
                <>
                  <User className="h-5 w-5 mr-2 text-cyan-400" />
                  Profile Update
                </>
              )}
              {actionType === 'workout_plan' && (
                <>
                  <Calendar className="h-5 w-5 mr-2 text-cyan-400" />
                  Workout Plan
                </>
              )}
              {actionType === 'nutrition_plan' && (
                <>
                  <Clipboard className="h-5 w-5 mr-2 text-cyan-400" />
                  Nutrition Plan
                </>
              )}
            </h3>
            <button
              onClick={() => setShowActionPanel(false)}
              className="p-1 rounded-full hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          </div>
          
          <div className="mb-4 max-h-48 overflow-y-auto bg-gray-900 rounded-lg p-3">
            {actionType === 'profile_update' && (
              <div className="space-y-2">
                {actionPanelData.fitnessGoals && (
                  <div>
                    <span className="text-gray-400 text-sm">Fitness Goals:</span>
                    <p className="text-white">{actionPanelData.fitnessGoals.primary}</p>
                  </div>
                )}
                {actionPanelData.fitnessLevel && (
                  <div>
                    <span className="text-gray-400 text-sm">Fitness Level:</span>
                    <p className="text-white">{actionPanelData.fitnessLevel}</p>
                  </div>
                )}
                {actionPanelData.daysPerWeek && (
                  <div>
                    <span className="text-gray-400 text-sm">Days Per Week:</span>
                    <p className="text-white">{actionPanelData.daysPerWeek}</p>
                  </div>
                )}
                {actionPanelData.equipment && (
                  <div>
                    <span className="text-gray-400 text-sm">Equipment:</span>
                    <p className="text-white">{Array.isArray(actionPanelData.equipment) 
                      ? actionPanelData.equipment.join(', ') 
                      : actionPanelData.equipment}</p>
                  </div>
                )}
              </div>
            )}
            
            {actionType === 'workout_plan' && actionPanelData.weeklyPlan && (
              <div className="space-y-2">
                <p className="text-white text-sm mb-2">Weekly Plan Overview:</p>
                {actionPanelData.weeklyPlan.map((day: any, index: number) => (
                  <div key={index} className="py-1 border-b border-gray-800 last:border-0">
                    <div className="flex justify-between">
                      <span className="text-cyan-300">{day.day}</span>
                      <span className="text-gray-400">{day.focus}</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {day.exercises.length} exercises planned
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {actionType === 'nutrition_plan' && (
              <div className="space-y-2">
                {actionPanelData.dailyCalories && (
                  <div>
                    <span className="text-gray-400 text-sm">Daily Calories:</span>
                    <p className="text-white">{actionPanelData.dailyCalories} calories</p>
                  </div>
                )}
                {actionPanelData.macroSplit && (
                  <div>
                    <span className="text-gray-400 text-sm">Macro Split:</span>
                    <p className="text-white">
                      Protein: {actionPanelData.macroSplit.protein}g, 
                      Carbs: {actionPanelData.macroSplit.carbs}g, 
                      Fat: {actionPanelData.macroSplit.fat}g
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowActionPanel(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleActionApply}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {actionType === 'profile_update' && 'Update Profile'}
              {actionType === 'workout_plan' && 'Apply Workout Plan'}
              {actionType === 'nutrition_plan' && 'Save Nutrition Plan'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render different views based on state
  if (isEmbedded) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden h-full border border-gray-700 shadow-xl relative">
        {renderChatInterface()}
        {renderActionPanel()}
      </div>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={toggleMinimize}
        className="fixed bottom-4 right-4 bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed ${
        isFullScreen ? 'inset-0 z-50' : 'bottom-4 right-4 w-96 h-[600px] z-40'
      } rounded-lg overflow-hidden transition-all duration-300 ease-in-out shadow-xl`}
    >
      <div className="bg-gray-900 h-full flex flex-col relative border border-gray-700">
        {renderChatInterface()}
        {renderActionPanel()}
      </div>
    </div>
  );
}