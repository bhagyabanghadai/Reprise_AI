'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dumbbell, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  suggestedWeight: number;
  notes?: string;
}

interface WorkoutLog {
  exerciseId: number;
  sets: number;
  reps: number;
  weight: number;
  rpe?: number;
  notes?: string;
}

export default function LogWorkoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [plannedExercises, setPlannedExercises] = useState<Exercise[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<{ [key: number]: WorkoutLog }>({});

  // Mock AI-planned workout for demonstration
  // This would be replaced with actual AI recommendations
  const mockPlannedWorkout: Exercise[] = [
    {
      id: 1,
      name: 'Bench Press',
      sets: 4,
      reps: 8,
      suggestedWeight: 185,
      notes: 'Focus on maintaining proper form throughout all sets'
    },
    {
      id: 2,
      name: 'Overhead Press',
      sets: 3,
      reps: 10,
      suggestedWeight: 135,
      notes: 'Progressive overload from last session'
    },
    {
      id: 3,
      name: 'Pull-ups',
      sets: 3,
      reps: 12,
      suggestedWeight: 0,
      notes: 'Use assistance if needed to complete all reps'
    }
  ];

  useEffect(() => {
    // Fetch exercises from the API
    const fetchExercises = async () => {
      try {
        // First try to get user's workout plan
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        
        const data = await response.json();
        console.log('Fetched exercises:', data);
        
        if (data.exercises && data.exercises.length > 0) {
          // Create a workout plan with the exercises
          // For now, we'll just use 3 random exercises
          const randomExercises = [...data.exercises]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((exercise: any, index: number) => ({
              id: exercise.id,
              name: exercise.name,
              sets: 3 + Math.floor(Math.random() * 2), // 3-4 sets
              reps: 8 + Math.floor(Math.random() * 5), // 8-12 reps
              suggestedWeight: 50 + Math.floor(Math.random() * 100), // 50-150 lbs
              notes: `Focus on proper form for ${exercise.name}`
            }));
          
          setPlannedExercises(randomExercises);
          
          // Initialize workout logs
          const initialLogs = randomExercises.reduce((acc, exercise) => ({
            ...acc,
            [exercise.id]: {
              exerciseId: exercise.id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.suggestedWeight,
              rpe: 0,
              notes: ''
            }
          }), {});
          
          setWorkoutLogs(initialLogs);
        } else {
          // Fallback to mock data if no exercises are found
          toast({
            title: 'Notice',
            description: 'Using default exercises as no exercise data was found.',
          });
          setPlannedExercises(mockPlannedWorkout);
          
          // Initialize workout logs with mock data
          const initialLogs = mockPlannedWorkout.reduce((acc, exercise) => ({
            ...acc,
            [exercise.id]: {
              exerciseId: exercise.id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.suggestedWeight,
              rpe: 0,
              notes: ''
            }
          }), {});
          
          setWorkoutLogs(initialLogs);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercises. Using default workout.',
          variant: 'destructive'
        });
        
        // Fallback to mock data
        setPlannedExercises(mockPlannedWorkout);
        
        // Initialize workout logs with mock data
        const initialLogs = mockPlannedWorkout.reduce((acc, exercise) => ({
          ...acc,
          [exercise.id]: {
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.suggestedWeight,
            rpe: 0,
            notes: ''
          }
        }), {});
        
        setWorkoutLogs(initialLogs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [toast]);

  const handleInputChange = (exerciseId: number, field: keyof WorkoutLog, value: string | number) => {
    setWorkoutLogs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Submit each exercise log
      for (const log of Object.values(workoutLogs)) {
        await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...log, userId: user?.id }),
        });
      }

      toast({
        title: 'Success',
        description: 'Workout logged successfully!',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-white hover:text-cyan-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Workout
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6"
        >
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Dumbbell className="mr-3 text-cyan-400" />
            Today's Planned Workout
          </h1>

          <div className="space-y-6">
            {plannedExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                  {exercise.name}
                </h3>
                <p className="text-gray-300 mb-4">{exercise.notes}</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-white mb-1">Sets</label>
                    <Input
                      type="number"
                      value={workoutLogs[exercise.id]?.sets || ''}
                      onChange={(e) => handleInputChange(exercise.id, 'sets', e.target.value)}
                      className="bg-white/5 border-gray-600 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Reps</label>
                    <Input
                      type="number"
                      value={workoutLogs[exercise.id]?.reps || ''}
                      onChange={(e) => handleInputChange(exercise.id, 'reps', e.target.value)}
                      className="bg-white/5 border-gray-600 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Weight (lbs)</label>
                    <Input
                      type="number"
                      value={workoutLogs[exercise.id]?.weight || ''}
                      onChange={(e) => handleInputChange(exercise.id, 'weight', e.target.value)}
                      className="bg-white/5 border-gray-600 text-white"
                      min="0"
                      step="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">RPE (1-10)</label>
                    <Input
                      type="number"
                      value={workoutLogs[exercise.id]?.rpe || ''}
                      onChange={(e) => handleInputChange(exercise.id, 'rpe', e.target.value)}
                      className="bg-white/5 border-gray-600 text-white"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-white mb-1">Notes</label>
                  <textarea
                    value={workoutLogs[exercise.id]?.notes || ''}
                    onChange={(e) => handleInputChange(exercise.id, 'notes', e.target.value)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white h-20 resize-none"
                    placeholder="Add any notes about your performance..."
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
