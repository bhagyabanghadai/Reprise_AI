'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Dumbbell, Activity, Utensils, Calendar, LineChart } from 'lucide-react'
import WorkoutForm from '@/components/WorkoutForm'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { AIChat } from '@/components/ChatBox'

interface WorkoutPlan {
  id: string
  name: string
  description: string
}

interface NutritionPlan {
  id: string
  name: string
  description: string
}

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

export default function Dashboard() {
  const { user } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch workout logs
        const workoutResponse = await fetch(`/api/workouts?userId=${user?.id}`);
        if (workoutResponse.ok) {
          const data = await workoutResponse.json();
          setRecentWorkouts(data.logs);
        }

        // For now using placeholder data for plans
        setWorkoutPlan({
          id: '1',
          name: 'Strength Building Program',
          description: 'A progressive overload program focused on compound movements.'
        });

        setNutritionPlan({
          id: '1',
          name: 'High Protein Diet Plan',
          description: 'Optimized nutrition plan for muscle growth and recovery.'
        });
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
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <motion.h1
            className="text-4xl font-bold mb-8 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {user?.name}!
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Workout Section */}
            <motion.div
              className="bg-white/10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-cyan-300 flex items-center">
                  <Dumbbell className="mr-2" /> Workout Tracker
                </h2>
                <Button 
                  onClick={() => setShowWorkoutForm(!showWorkoutForm)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  {showWorkoutForm ? 'Close Form' : 'Log Workout'}
                </Button>
              </div>

              {showWorkoutForm ? (
                <WorkoutForm userId={user?.id || ''} />
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">{workoutPlan?.name}</h3>
                  <p className="text-gray-300 mb-4">{workoutPlan?.description}</p>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-cyan-300">Recent Workouts</h4>
                    {recentWorkouts.length > 0 ? (
                      <div className="space-y-2">
                        {recentWorkouts.map((log) => (
                          <div key={log.id} className="bg-white/5 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{log.exercise.name}</span>
                              <span className="text-gray-400 text-sm">{formatDate(log.date)}</span>
                            </div>
                            <div className="text-gray-300 text-sm mt-1">
                              {log.sets} sets × {log.reps} reps @ {log.weight}lbs
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No recent workouts logged</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Nutrition Section */}
            <motion.div
              className="bg-white/10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <Utensils className="mr-2" /> Nutrition Plan
              </h2>
              {isLoading ? (
                <p className="text-gray-300">Loading your nutrition plan...</p>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">{nutritionPlan?.name}</h3>
                  <p className="text-gray-300">{nutritionPlan?.description}</p>
                </>
              )}
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Progress Tracker */}
            <motion.div
              className="bg-white/10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <LineChart className="mr-2" /> Progress Analytics
              </h2>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">Workout Volume</h3>
                  <div className="h-40 flex items-center justify-center">
                    {/* Add chart component here */}
                    <p className="text-gray-400">Progress visualization coming soon</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Schedule Section */}
            <motion.div
              className="bg-white/10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <Calendar className="mr-2" /> Upcoming Sessions
              </h2>
              <div className="space-y-3">
                {['Monday - Upper Body', 'Wednesday - Lower Body', 'Friday - Full Body'].map((session, index) => (
                  <div key={index} className="bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{session}</span>
                      <Button variant="outline" size="sm" className="text-cyan-300 border-cyan-300 hover:bg-cyan-300/10">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
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