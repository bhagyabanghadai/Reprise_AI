'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { 
  Brain, Shield, Clock, Zap, ChevronDown, ChevronUp,
  MessageSquare, Sparkles, AlertTriangle, CheckCircle,
  Award, TrendingUp, Activity, Calendar
} from 'lucide-react'

interface AICoachProps {
  userId: string
  recentWorkouts?: any[]
  userStats?: any
}

interface CoachFeedback {
  type: 'insight' | 'warning' | 'achievement' | 'plan'
  title: string
  message: string
  icon: any
  color: string
}

export default function AICoach2({ userId, recentWorkouts = [], userStats = {} }: AICoachProps) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<CoachFeedback[]>([])
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([])
  const [expandedSection, setExpandedSection] = useState<string | null>('feedback')
  const { toast } = useToast()
  const hasLoadedData = useRef(false)

  // Sample weekly plan data
  const sampleWeeklyPlan = [
    { 
      day: 'Monday', 
      focus: 'Upper Body Strength', 
      exercises: [
        { name: 'Bench Press', sets: 5, reps: 5, weight: 185, notes: 'Focus on bar path and full ROM' },
        { name: 'Pull-ups', sets: 4, reps: 8, weight: 0, notes: 'Add weight if too easy' },
        { name: 'Overhead Press', sets: 3, reps: 10, weight: 105, notes: 'Slight increase from last week' }
      ],
      completed: false
    },
    { 
      day: 'Tuesday', 
      focus: 'Active Recovery', 
      exercises: [
        { name: 'Light Cycling', sets: 1, reps: 1, weight: 0, notes: '20 minutes steady state' },
        { name: 'Mobility Work', sets: 1, reps: 1, weight: 0, notes: 'Focus on hip and shoulder mobility' }
      ],
      completed: false
    },
    { 
      day: 'Wednesday', 
      focus: 'Lower Body Power', 
      exercises: [
        { name: 'Squat', sets: 4, reps: 6, weight: 275, notes: 'Focus on explosive concentric' },
        { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 185, notes: 'Added to address posterior chain weakness' },
        { name: 'Leg Press', sets: 3, reps: 12, weight: 360, notes: 'Moderate weight, focus on control' }
      ],
      completed: false
    },
    { 
      day: 'Thursday', 
      focus: 'Rest Day', 
      exercises: [],
      completed: false
    },
    { 
      day: 'Friday', 
      focus: 'Upper Body Hypertrophy', 
      exercises: [
        { name: 'Incline Bench Press', sets: 4, reps: 10, weight: 155, notes: 'Higher volume than Monday' },
        { name: 'Barbell Rows', sets: 4, reps: 10, weight: 165, notes: 'Focus on mid-back contraction' },
        { name: 'Lateral Raises', sets: 3, reps: 15, weight: 20, notes: 'Added to address lagging shoulders' }
      ],
      completed: false
    },
    { 
      day: 'Saturday', 
      focus: 'Full Body Power', 
      exercises: [
        { name: 'Deadlift', sets: 5, reps: 3, weight: 315, notes: 'Test day - aiming for PR' },
        { name: 'Push Press', sets: 4, reps: 6, weight: 135, notes: 'Explosive movement' },
        { name: 'Pull-ups', sets: 3, reps: 10, weight: 0, notes: 'Volume focus' }
      ],
      completed: false
    },
    { 
      day: 'Sunday', 
      focus: 'Rest Day', 
      exercises: [],
      completed: false
    }
  ]

  // Sample feedback data
  const sampleFeedback = [
    { 
      type: 'insight' as const, 
      title: 'Progress Insight', 
      message: 'Your bench press strength has increased by 12% this month. Consistency in upper body training is showing results.',
      icon: Sparkles,
      color: 'bg-purple-500'
    },
    { 
      type: 'warning' as const, 
      title: 'Form Warning', 
      message: 'Bar speed decreased in your last squat session. Consider reducing weight by 5-10% next workout or extending rest periods.',
      icon: AlertTriangle,
      color: 'bg-amber-500'
    },
    { 
      type: 'achievement' as const, 
      title: 'Achievement Unlocked', 
      message: 'New PR! You\'ve hit a personal record on deadlift at 315 lbs. Amazing progress!',
      icon: Award,
      color: 'bg-green-500'
    },
    { 
      type: 'plan' as const, 
      title: 'Plan Adjustment', 
      message: 'Added Romanian Deadlifts to address posterior chain weakness detected in your squat and deadlift patterns.',
      icon: TrendingUp,
      color: 'bg-blue-500'
    }
  ]

  // Load data only once when component mounts
  useEffect(() => {
    if (hasLoadedData.current) return;
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Try to fetch data from API
        const response = await fetch(`/api/coach-insights?userId=${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.insights) {
            setFeedback(data.insights);
            if (data.weeklyPlan) {
              setWeeklyPlan(data.weeklyPlan);
            } else {
              setWeeklyPlan(sampleWeeklyPlan);
            }
          } else {
            // Fallback to sample data
            setFeedback(sampleFeedback);
            setWeeklyPlan(sampleWeeklyPlan);
          }
        } else {
          // API error, use sample data
          setFeedback(sampleFeedback);
          setWeeklyPlan(sampleWeeklyPlan);
        }
      } catch (error) {
        console.error('Error loading coach data:', error);
        // Fallback to sample data
        setFeedback(sampleFeedback);
        setWeeklyPlan(sampleWeeklyPlan);
      } finally {
        setLoading(false);
        hasLoadedData.current = true;
      }
    };
    
    loadData();
  }, [userId]);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todaysPlan = weeklyPlan.length > 0 
    ? weeklyPlan[dayOfWeek === 0 ? 6 : dayOfWeek - 1] // Adjust for array index
    : { day: 'Today', focus: 'No workout planned', exercises: [] };

  return (
    <div className="space-y-4">
      {/* Morning Briefing / Today's Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-md rounded-lg p-5 border border-blue-500/30"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">{todaysPlan.day}'s Workout</h2>
          </div>
          <div className="flex items-center bg-blue-500/20 text-blue-300 text-sm py-1 px-3 rounded-full">
            <Activity className="h-3 w-3 mr-1" /> 
            {todaysPlan.focus}
          </div>
        </div>
        
        {todaysPlan.exercises && todaysPlan.exercises.length > 0 ? (
          <div className="space-y-3">
            {todaysPlan.exercises.map((exercise: { name: string, sets: number, reps: number, weight: number, notes?: string }, index: number) => (
              <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors">
                <div className="flex justify-between">
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-blue-300">{exercise.sets} × {exercise.reps} {exercise.weight > 0 ? `@ ${exercise.weight} lbs` : ''}</div>
                </div>
                {exercise.notes && (
                  <div className="text-sm text-gray-400 mt-1">{exercise.notes}</div>
                )}
              </div>
            ))}
            <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
              Complete Today's Workout
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-10 w-10 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">{todaysPlan.focus}</p>
            <p className="text-sm text-gray-400">Take time to recover and prepare for your next training session</p>
          </div>
        )}
      </motion.div>

      {/* AI Coach Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div 
          className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-t-lg border border-purple-500/30 cursor-pointer"
          onClick={() => toggleSection('feedback')}
        >
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Coach Feedback</h2>
          </div>
          {expandedSection === 'feedback' ? (
            <ChevronUp className="h-5 w-5 text-purple-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-purple-400" />
          )}
        </div>
        
        {expandedSection === 'feedback' && (
          <div className="p-4 bg-black/20 backdrop-blur-sm rounded-b-lg border-x border-b border-purple-500/30">
            <div className="space-y-3">
              {feedback.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-3 rounded-lg border border-${item.color.replace('bg-', '')}/30 flex items-start`}
                >
                  <div className={`${item.color} p-2 rounded-full mr-3`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Weekly Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div 
          className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-md rounded-t-lg border border-blue-500/30 cursor-pointer"
          onClick={() => toggleSection('weeklyPlan')}
        >
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Weekly Plan</h2>
          </div>
          {expandedSection === 'weeklyPlan' ? (
            <ChevronUp className="h-5 w-5 text-blue-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-400" />
          )}
        </div>
        
        {expandedSection === 'weeklyPlan' && (
          <div className="p-4 bg-black/20 backdrop-blur-sm rounded-b-lg border-x border-b border-blue-500/30">
            <div className="space-y-3">
              {weeklyPlan.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    index === dayOfWeek - 1 || (index === 6 && dayOfWeek === 0)
                      ? 'border-blue-500/50 bg-blue-900/20'
                      : 'border-white/10'
                  } hover:border-blue-500/30 transition-colors`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium text-white">{day.day}</div>
                    <div className="text-sm text-blue-300">{day.focus}</div>
                  </div>
                  {day.exercises && day.exercises.length > 0 ? (
                    <div className="text-sm text-gray-400">
                      {day.exercises.map((exercise: { name: string, sets: number, reps: number, weight: number, notes?: string }, idx: number) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                          <span>{exercise.name}</span>
                          <span>{exercise.sets}×{exercise.reps}{exercise.weight > 0 ? ` @ ${exercise.weight}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Rest day</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}