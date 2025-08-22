'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Dumbbell, Calendar, BarChart2, PlusCircle, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkoutsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading workouts
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogWorkout = () => {
    router.push('/workouts/log');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <Dumbbell className="inline-block mr-3 text-blue-400" />
              Your Workouts
            </h1>
            <p className="text-gray-300 text-lg">
              Track your progress and log new workouts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <Calendar className="text-blue-400 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
              <p className="text-gray-300 mb-4">Plan your upcoming workouts</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Schedule
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <PlusCircle className="text-green-400 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-white mb-2">Log Workout</h3>
              <p className="text-gray-300 mb-4">Record your latest training session</p>
              <Button 
                onClick={handleLogWorkout}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Logging
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <BarChart2 className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-white mb-2">Progress</h3>
              <p className="text-gray-300 mb-4">View your fitness analytics</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View Progress
              </Button>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Activity className="animate-spin text-blue-400 mx-auto mb-4" size={48} />
              <p className="text-gray-300">Loading your workouts...</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Recent Workouts</h2>
              {workouts.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="text-gray-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-300 mb-4">No workouts logged yet</p>
                  <Button 
                    onClick={handleLogWorkout}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Log Your First Workout
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Workout list will be populated here */}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}