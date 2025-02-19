'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Dumbbell, Activity, Utensils, Calendar } from 'lucide-react'
import { api } from '@/lib/api'

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

export default function Dashboard() {
  const { user } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [workoutRes, nutritionRes] = await Promise.all([
          api.get('/workout-plan'),
          api.get('/nutrition-plan')
        ])
        setWorkoutPlan(workoutRes.data)
        setNutritionPlan(nutritionRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

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
                <p className="text-gray-300">Loading your workout plan...</p>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">{workoutPlan?.name}</h3>
                  <p className="text-gray-300">{workoutPlan?.description}</p>
                </>
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