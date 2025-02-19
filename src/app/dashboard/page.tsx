'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Dumbbell, Activity, Utensils, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroup: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const { user } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch workout plan
        const workoutRes = await fetch(`/api/workout-plan?userId=${user?.id}`);
        if (!workoutRes.ok) {
          throw new Error('Failed to fetch workout plan');
        }
        const workoutData = await workoutRes.json();
        setWorkoutPlan(workoutData);

        // Fetch nutrition plan
        const nutritionRes = await fetch(`/api/nutrition-plan?userId=${user?.id}`);
        if (!nutritionRes.ok) {
          throw new Error('Failed to fetch nutrition plan');
        }
        const nutritionData = await nutritionRes.json();
        setNutritionPlan(nutritionData);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to load your fitness data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user?.id, toast])

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
            <motion.div
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <Dumbbell className="mr-2" /> Today's Workout
              </h2>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-300/20 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300/20 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300/20 rounded w-5/6"></div>
                </div>
              ) : workoutPlan ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">{workoutPlan.name}</h3>
                  <div className="space-y-4">
                    <p className="text-gray-300">{workoutPlan.description}</p>
                    {workoutPlan.exercises && (
                      <ul className="space-y-2">
                        {workoutPlan.exercises.map((exercise) => (
                          <li key={exercise.id} className="flex items-center text-gray-300">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                            {exercise.name} - {exercise.muscleGroup}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-300">No workout planned for today. Create one!</p>
              )}
            </motion.div>
            <motion.div
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
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
            <motion.div
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <Activity className="mr-2" /> Progress Tracker
              </h2>
              <p className="text-gray-300">Your progress chart will be displayed here.</p>
            </motion.div>
            <motion.div
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <Calendar className="mr-2" /> Upcoming Sessions
              </h2>
              <ul className="space-y-2 text-gray-300">
                <li>Monday, 10:00 AM - HIIT Workout</li>
                <li>Wednesday, 2:00 PM - Yoga Session</li>
                <li>Friday, 11:00 AM - Strength Training</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}