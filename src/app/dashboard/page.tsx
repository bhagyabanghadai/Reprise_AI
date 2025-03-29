'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Dumbbell, Activity, LineChart, 
  Brain, Shield, Clock, Heart,
  Calendar, Target, Award, Flame,
  BarChart2, Droplet, TrendingUp, Menu,
  User, Settings, Home, Clipboard, ChevronUp,
  Search, Zap, Smile, Frown, Meh
} from 'lucide-react'
import WorkoutForm from '@/components/WorkoutForm'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { AIChat } from '@/components/ChatBox'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface WorkoutLog {
  id: number
  exerciseId: number
  sets: number
  reps: number
  weight: number
  date: string
  exercise: {
    name: string
    muscleGroup: string
  }
}

interface ProgressStats {
  totalWorkouts: number
  totalVolume: number
  strengthScore: number
  recoveryScore: number
  streak: number
  consistency: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalWorkouts: 0,
    totalVolume: 0,
    strengthScore: 0,
    recoveryScore: 0,
    streak: 12,
    consistency: 87
  })
  const { toast } = useToast()
  const router = useRouter()

  // Mock muscle group distribution data
  const muscleGroupDistribution = [
    { name: 'Chest', value: 30, color: '#0074D9' },
    { name: 'Back', value: 25, color: '#6F42C1' },
    { name: 'Legs', value: 20, color: '#28A745' },
    { name: 'Arms', value: 15, color: '#DC3545' },
    { name: 'Shoulders', value: 10, color: '#FFC107' }
  ]

  // Mock motivation quote - this would rotate daily in production
  const motivationalQuote = {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown"
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch workout logs
        const workoutResponse = await fetch(`/api/workouts?userId=${user?.id || 'user-123'}`)
        if (workoutResponse.ok) {
          const data = await workoutResponse.json()
          setRecentWorkouts(data.logs || [])

          // Calculate progress stats
          const stats = {
            totalWorkouts: data.logs ? data.logs.length : 0,
            totalVolume: data.logs ? data.logs.reduce((acc: number, log: WorkoutLog) =>
              acc + (log.sets * log.reps * log.weight), 0) : 0,
            strengthScore: 85, // This will be calculated by AI
            recoveryScore: 90, // This will be calculated by AI
            streak: 12, // Days of consecutive workouts
            consistency: 87 // Percentage of workout plan adherence
          }
          setProgressStats(stats)
        } else {
          // Set default stats if API call fails
          setProgressStats({
            totalWorkouts: 8,
            totalVolume: 12500,
            strengthScore: 85,
            recoveryScore: 90,
            streak: 12,
            consistency: 87
          })
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        // Set default stats if API call fails
        setProgressStats({
          totalWorkouts: 8,
          totalVolume: 12500,
          strengthScore: 85,
          recoveryScore: 90,
          streak: 12,
          consistency: 87
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id, toast])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  const handleMoodSelection = (mood: string) => {
    setCurrentMood(mood)
    toast({
      title: "Mood Logged",
      description: `Your mood has been recorded as ${mood}`,
    })
  }

  // Mock PR data
  const recentPRs = [
    { exercise: 'Bench Press', weight: '225 lbs', date: '2 days ago' },
    { exercise: 'Squat', weight: '315 lbs', date: '1 week ago' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-cyan-400 mr-2" />
              <span className="text-2xl font-bold text-white">FitAI</span>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-white hover:text-cyan-300 font-medium flex items-center">
                <Home className="mr-1 h-4 w-4" /> Dashboard
              </Link>
              <Link href="/workouts/log" className="text-white hover:text-cyan-300 font-medium flex items-center">
                <Clipboard className="mr-1 h-4 w-4" /> Daily Logs
              </Link>
              <Link href="/progress" className="text-white hover:text-cyan-300 font-medium flex items-center">
                <BarChart2 className="mr-1 h-4 w-4" /> Progress
              </Link>
              <Link href="/workouts" className="text-white hover:text-cyan-300 font-medium flex items-center">
                <Calendar className="mr-1 h-4 w-4" /> Plans
              </Link>
              <Link href="/settings" className="text-white hover:text-cyan-300 font-medium flex items-center">
                <Settings className="mr-1 h-4 w-4" /> Settings
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative">
                <button className="bg-white/10 p-1 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'Fitness Enthusiast'}!
            </h1>
            <p className="text-gray-300">
              Your AI-powered fitness journey continues. Here's your progress overview:
            </p>
          </motion.div>

          {/* Dashboard Tabs */}
          <div className="mb-6 flex space-x-1 bg-white/5 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'workouts', label: 'Workouts', icon: Dumbbell },
              { id: 'nutrition', label: 'Nutrition', icon: Droplet }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 backdrop-blur-sm p-4 rounded-lg mb-8 border border-cyan-500/30"
          >
            <p className="text-white italic text-center">" {motivationalQuote.text} "</p>
            <p className="text-cyan-300 text-center text-sm mt-1">— {motivationalQuote.author}</p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { title: 'Workouts', value: progressStats.totalWorkouts, icon: Dumbbell, color: 'from-blue-500 to-blue-700' },
              { title: 'Volume (lbs)', value: progressStats.totalVolume.toLocaleString(), icon: Activity, color: 'from-purple-500 to-purple-700' },
              { title: 'Strength', value: `${progressStats.strengthScore}/100`, icon: Zap, color: 'from-red-500 to-red-700' },
              { title: 'Recovery', value: `${progressStats.recoveryScore}/100`, icon: Heart, color: 'from-green-500 to-green-700' },
              { title: 'Streak', value: `${progressStats.streak} days`, icon: Flame, color: 'from-orange-500 to-orange-700' },
              { title: 'Consistency', value: `${progressStats.consistency}%`, icon: Target, color: 'from-cyan-500 to-cyan-700' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/10 border-none h-full backdrop-blur-md overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20`}></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-white" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workout Summary Section */}
            <motion.div
              className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center">
                    <Dumbbell className="mr-2 text-cyan-400" /> Recent Activity
                  </h2>
                  <Button
                    onClick={() => router.push('/workouts/log')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    Log Workout
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentWorkouts && recentWorkouts.length > 0 ? (
                    <div className="space-y-3">
                      {recentWorkouts.map((log) => (
                        <motion.div
                          key={log.id}
                          className="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-white font-medium">{log.exercise.name}</h4>
                              <p className="text-gray-400 text-sm">{formatDate(log.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-cyan-300">{log.sets} × {log.reps}</p>
                              <p className="text-gray-400">{log.weight} lbs</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clipboard className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                      <h3 className="text-lg font-medium text-white">No recent workouts</h3>
                      <p className="text-gray-400 mb-4">Start tracking your fitness journey today</p>
                      <Button 
                        onClick={() => router.push('/workouts/log')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500"
                      >
                        Log Your First Workout
                      </Button>
                    </div>
                  )}
                  
                  {/* Recent PRs (Personal Records) */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-3">
                      <Award className="mr-2 text-yellow-400" /> Recent PRs
                    </h3>
                    <div className="space-y-2">
                      {recentPRs.map((pr, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-lg border border-yellow-500/30">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-yellow-300 font-medium">{pr.exercise}</span>
                              <span className="text-white ml-2">{pr.weight}</span>
                            </div>
                            <div className="text-gray-400 text-sm">{pr.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mood Tracker */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white flex items-center mb-3">
                      <Heart className="mr-2 text-pink-400" /> Workout Mood
                    </h3>
                    <p className="text-gray-300 mb-3">How did you feel after your last workout?</p>
                    <div className="flex space-x-3">
                      {[
                        { mood: 'Energized', icon: Smile, color: 'bg-green-500' },
                        { mood: 'Neutral', icon: Meh, color: 'bg-blue-500' },
                        { mood: 'Tired', icon: Frown, color: 'bg-red-500' }
                      ].map((item) => (
                        <button
                          key={item.mood}
                          onClick={() => handleMoodSelection(item.mood)}
                          className={`flex-1 flex flex-col items-center py-3 px-2 rounded-lg transition-all ${
                            currentMood === item.mood 
                              ? `${item.color} bg-opacity-100 text-white`
                              : 'bg-white/5 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          <item.icon className="h-6 w-6 mb-1" />
                          <span className="text-sm">{item.mood}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Progress Analysis & Muscle Distribution */}
            <motion.div className="space-y-6">
              {/* AI Progress Analysis */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
                    <Brain className="mr-2 text-purple-400" /> AI Coach
                  </h2>
                  <div className="space-y-4">
                    {/* Recovery Status */}
                    <Card className="bg-gradient-to-r from-green-900/30 to-green-700/20 border-green-500/30 hover:border-green-500/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-white flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-green-400" />
                          Recovery Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-300 text-sm">
                          Your recovery is optimal. Ready for high-intensity training today.
                        </div>
                      </CardContent>
                    </Card>

                    {/* Next Workout Recommendation */}
                    <Card className="bg-gradient-to-r from-blue-900/30 to-blue-700/20 border-blue-500/30 hover:border-blue-500/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-white flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-blue-400" />
                          Next Workout Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-300 text-sm">
                          Recommended: Upper Body Strength
                          <ul className="mt-2 space-y-1">
                            <li>• Bench Press: 4×8 @185lbs</li>
                            <li>• Overhead Press: 3×10 @135lbs</li>
                            <li>• Pull-ups: 3×12</li>
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button className="text-xs bg-blue-600 hover:bg-blue-700 w-full">
                          Start This Workout
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* Progress Insights */}
                    <Card className="bg-gradient-to-r from-purple-900/30 to-purple-700/20 border-purple-500/30 hover:border-purple-500/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-white flex items-center">
                          <LineChart className="w-5 h-5 mr-2 text-purple-400" />
                          Progress Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-300 text-sm">
                          Your bench press strength has increased by 12% this month.
                          Consistency in upper body training is showing results.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
              
              {/* Muscle Group Distribution */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                    <BarChart2 className="mr-2 text-cyan-400" /> Muscle Distribution
                  </h2>
                  <div className="space-y-3">
                    {muscleGroupDistribution.map(group => (
                      <div key={group.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{group.name}</span>
                          <span className="text-white">{group.value}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${group.value}%`,
                              backgroundColor: group.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    Based on your last 10 workouts
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* AI Chat Integration */}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      {!showAIChat && (
        <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-all duration-300"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </button>
          <Button
            onClick={() => setShowAIChat(true)}
            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Brain className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}
    </div>
  )
}