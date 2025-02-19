'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Dumbbell, Activity, LineChart,
  Brain, Shield, Clock, Heart
} from 'lucide-react'
import WorkoutForm from '@/components/WorkoutForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { AIChat } from '@/components/ChatBox'
import { useRouter } from 'next/navigation';

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
}

export default function Dashboard() {
  const { user } = useAuth()
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalWorkouts: 0,
    totalVolume: 0,
    strengthScore: 0,
    recoveryScore: 0
  })
  const { toast } = useToast()
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch workout logs
        const workoutResponse = await fetch(`/api/workouts?userId=${user?.id}`)
        if (workoutResponse.ok) {
          const data = await workoutResponse.json()
          setRecentWorkouts(data.logs)

          // Calculate progress stats
          const stats = {
            totalWorkouts: data.logs.length,
            totalVolume: data.logs.reduce((acc: number, log: WorkoutLog) =>
              acc + (log.sets * log.reps * log.weight), 0),
            strengthScore: 85, // This will be calculated by AI
            recoveryScore: 90 // This will be calculated by AI
          }
          setProgressStats(stats)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user?.id, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-300">
              Your AI-powered fitness journey continues. Here's your progress overview:
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Workouts Completed', value: progressStats.totalWorkouts, icon: Dumbbell },
              { title: 'Total Volume (lbs)', value: progressStats.totalVolume.toLocaleString(), icon: Activity },
              { title: 'Strength Score', value: `${progressStats.strengthScore}/100`, icon: Brain },
              { title: 'Recovery Score', value: `${progressStats.recoveryScore}/100`, icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/10 border-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-cyan-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Workout Logging Section */}
            <motion.div
              className="bg-white/10 rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-cyan-300 flex items-center">
                    <Dumbbell className="mr-2" /> Workout Tracker
                  </h2>
                  <Button
                    onClick={() => router.push('/workouts/log')}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Log Workout
                  </Button>
                </div>

                {showWorkoutForm ? (
                  <WorkoutForm userId={user?.id || ''} />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-cyan-300">Recent Workouts</h3>
                    <div className="space-y-3">
                      {recentWorkouts.map((log) => (
                        <motion.div
                          key={log.id}
                          className="bg-white/5 p-4 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
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
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Progress Analysis */}
            <motion.div
              className="bg-white/10 rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-cyan-300 flex items-center">
                  <Brain className="mr-2" /> AI Analysis
                </h2>
                <div className="space-y-6">
                  {/* Recovery Status */}
                  <Card className="bg-white/5 border-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-cyan-400" />
                        Recovery Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-300">
                        Your recovery is optimal. Ready for high-intensity training today.
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Workout Recommendation */}
                  <Card className="bg-white/5 border-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-cyan-400" />
                        Next Workout Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-300">
                        Recommended: Upper Body Strength
                        <ul className="mt-2 space-y-1">
                          <li>• Bench Press: 4×8 @185lbs</li>
                          <li>• Overhead Press: 3×10 @135lbs</li>
                          <li>• Pull-ups: 3×12</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progress Insights */}
                  <Card className="bg-white/5 border-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center">
                        <LineChart className="w-5 h-5 mr-2 text-cyan-400" />
                        Progress Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-300">
                        Your bench press strength has increased by 12% this month.
                        Consistency in upper body training is showing results.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* AI Chat Integration */}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      {!showAIChat && (
        <Button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-4 right-4 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span className="sr-only">Open AI Chat</span>
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </Button>
      )}
    </div>
  )
}