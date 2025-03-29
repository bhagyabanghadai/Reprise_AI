'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dumbbell, ArrowLeft, Save, PlusCircle, MinusCircle, 
  ChevronDown, ChevronUp, Activity, Clock, Calendar, 
  BarChart2, Award, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  description?: string;
  category?: string;
}

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  timestamp: Date;
  isCompleted: boolean;
}

interface WorkoutExercise {
  exerciseId: number;
  exercise: Exercise;
  sets: ExerciseSet[];
  suggestedWeight?: number;
  notes?: string;
}

export default function LogWorkoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    // Fetch exercises from the API
    const fetchExercises = async () => {
      try {
        // Fetch all available exercises
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        
        const data = await response.json();
        console.log('Fetched exercises:', data);
        
        if (data.exercises && data.exercises.length > 0) {
          setAvailableExercises(data.exercises);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercises.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [toast]);

  const toggleExerciseExpand = (exerciseId: number) => {
    if (expandedExercise === exerciseId) {
      setExpandedExercise(null);
    } else {
      setExpandedExercise(exerciseId);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      exercise: exercise,
      sets: [{
        id: `set-${Date.now()}-0`,
        reps: 8,
        weight: 0,
        timestamp: new Date(),
        isCompleted: false
      }],
      notes: ''
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
    setSearchQuery('');
    setExpandedExercise(exercise.id);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...workoutExercises];
    const sets = updatedExercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    
    // Create a new set with the same values as the last set
    updatedExercises[exerciseIndex].sets.push({
      id: `set-${Date.now()}-${sets.length}`,
      reps: lastSet.reps,
      weight: lastSet.weight,
      timestamp: new Date(),
      isCompleted: false
    });

    setWorkoutExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    // If no sets left, remove the exercise
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setWorkoutExercises(updatedExercises);
  };

  const handleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets[setIndex].isCompleted = 
      !updatedExercises[exerciseIndex].sets[setIndex].isCompleted;
    
    setWorkoutExercises(updatedExercises);
  };

  const handleSetChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: 'reps' | 'weight', 
    value: number
  ) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setWorkoutExercises(updatedExercises);
  };

  const handleNotesChange = (exerciseIndex: number, notes: string) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].notes = notes;
    setWorkoutExercises(updatedExercises);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises.splice(exerciseIndex, 1);
    setWorkoutExercises(updatedExercises);
  };

  const filteredExercises = searchQuery.trim() === '' 
    ? availableExercises 
    : availableExercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSubmit = async () => {
    if (workoutExercises.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one exercise to log a workout.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert our workout model to the API model
      for (const workoutExercise of workoutExercises) {
        const completedSets = workoutExercise.sets.filter(set => set.isCompleted);
        
        if (completedSets.length === 0) continue; // Skip exercises with no completed sets
        
        // Calculate averages
        const avgReps = Math.round(
          completedSets.reduce((sum, set) => sum + set.reps, 0) / completedSets.length
        );
        const avgWeight = Math.round(
          completedSets.reduce((sum, set) => sum + set.weight, 0) / completedSets.length
        );
        
        // Submit workout log
        await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exerciseId: workoutExercise.exerciseId,
            sets: completedSets.length,
            reps: avgReps,
            weight: avgWeight,
            notes: workoutExercise.notes,
            userId: user?.id || 'user-123',
          }),
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
            disabled={isSaving || workoutExercises.length === 0}
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
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Dumbbell className="mr-3 text-cyan-400" /> Log Workout
              </h1>
              <p className="text-gray-300 mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-cyan-400" />
                {formatDate(currentDate)}
              </p>
            </div>
            
            <Button 
              onClick={() => setShowExerciseSelector(!showExerciseSelector)} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          {/* Exercise Selector */}
          {showExerciseSelector && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30"
            >
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
                {filteredExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
                    onClick={() => handleAddExercise(exercise)}
                  >
                    <div className="font-medium text-white">{exercise.name}</div>
                    <div className="text-sm text-cyan-300">{exercise.muscleGroup}</div>
                  </div>
                ))}
                
                {filteredExercises.length === 0 && (
                  <div className="col-span-3 text-center py-6 text-gray-400">
                    No exercises found. Try a different search term.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Workout Log */}
          <div className="space-y-4">
            {workoutExercises.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No exercises added yet</h3>
                <p className="text-gray-300 mb-6">Start by adding exercises to your workout</p>
                <Button 
                  onClick={() => setShowExerciseSelector(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
            ) : (
              workoutExercises.map((workoutExercise, exerciseIndex) => (
                <motion.div
                  key={`${workoutExercise.exerciseId}-${exerciseIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/10"
                >
                  {/* Exercise Header */}
                  <div 
                    className={`flex justify-between items-center p-4 cursor-pointer ${
                      expandedExercise === workoutExercise.exerciseId ? 'bg-cyan-900/30' : ''
                    }`}
                    onClick={() => toggleExerciseExpand(workoutExercise.exerciseId)}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-3 bg-gradient-to-br flex items-center justify-center
                        ${
                          workoutExercise.exercise.muscleGroup === 'chest' ? 'from-blue-500 to-blue-700' :
                          workoutExercise.exercise.muscleGroup === 'back' ? 'from-purple-500 to-purple-700' :
                          workoutExercise.exercise.muscleGroup === 'legs' ? 'from-green-500 to-green-700' :
                          workoutExercise.exercise.muscleGroup === 'arms' ? 'from-red-500 to-red-700' :
                          workoutExercise.exercise.muscleGroup === 'shoulders' ? 'from-yellow-500 to-yellow-700' :
                          'from-gray-500 to-gray-700'
                        }`}
                      >
                        <span className="text-white text-xs font-medium">
                          {workoutExercise.exercise.muscleGroup.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{workoutExercise.exercise.name}</h3>
                        <div className="text-xs text-cyan-300">
                          {workoutExercise.sets.filter(set => set.isCompleted).length} / {workoutExercise.sets.length} sets completed
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveExercise(exerciseIndex);
                        }}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      
                      {expandedExercise === workoutExercise.exerciseId ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Exercise Details (Sets) */}
                  {expandedExercise === workoutExercise.exerciseId && (
                    <div className="p-4 bg-black/20">
                      <div className="mb-4">
                        <div className="grid grid-cols-12 mb-2 text-xs text-gray-400 font-medium">
                          <div className="col-span-1 text-center">#</div>
                          <div className="col-span-4">WEIGHT</div>
                          <div className="col-span-3">REPS</div>
                          <div className="col-span-4 text-center">STATUS</div>
                        </div>
                        
                        {workoutExercise.sets.map((set, setIndex) => (
                          <div 
                            key={set.id}
                            className={`grid grid-cols-12 items-center py-2 border-b border-white/5 ${
                              set.isCompleted ? 'bg-green-900/10' : ''
                            }`}
                          >
                            <div className="col-span-1 text-center text-sm text-gray-400">{setIndex + 1}</div>
                            
                            <div className="col-span-4 pr-2">
                              <div className="flex items-center bg-black/30 rounded-lg w-full">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-lg text-gray-400 hover:text-white"
                                  onClick={() => handleSetChange(exerciseIndex, setIndex, 'weight', Math.max(0, set.weight - 5))}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', Number(e.target.value))}
                                  className="border-0 bg-transparent text-white text-center focus:ring-0"
                                  min="0"
                                  step="5"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-lg text-gray-400 hover:text-white"
                                  onClick={() => handleSetChange(exerciseIndex, setIndex, 'weight', set.weight + 5)}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="col-span-3 pr-2">
                              <div className="flex items-center bg-black/30 rounded-lg w-full">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-lg text-gray-400 hover:text-white"
                                  onClick={() => handleSetChange(exerciseIndex, setIndex, 'reps', Math.max(1, set.reps - 1))}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', Number(e.target.value))}
                                  className="border-0 bg-transparent text-white text-center focus:ring-0"
                                  min="1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-lg text-gray-400 hover:text-white"
                                  onClick={() => handleSetChange(exerciseIndex, setIndex, 'reps', set.reps + 1)}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="col-span-4 flex justify-center space-x-2">
                              <Button
                                variant={set.isCompleted ? "default" : "outline"}
                                className={`w-20 ${
                                  set.isCompleted 
                                    ? "bg-green-600 hover:bg-green-700 border-green-600" 
                                    : "text-gray-400 border-gray-600 hover:bg-white/5"
                                }`}
                                onClick={() => handleSetComplete(exerciseIndex, setIndex)}
                              >
                                {set.isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Done
                                  </>
                                ) : "Mark Done"}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/20"
                          onClick={() => handleAddSet(exerciseIndex)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Set
                        </Button>
                        
                        <div className="text-xs text-gray-400">
                          Total volume: {workoutExercise.sets
                            .filter(set => set.isCompleted)
                            .reduce((total, set) => total + (set.weight * set.reps), 0)
                          } lbs
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-gray-300 text-sm mb-1">Notes</label>
                        <textarea
                          value={workoutExercise.notes || ''}
                          onChange={(e) => handleNotesChange(exerciseIndex, e.target.value)}
                          className="w-full p-2 rounded-lg bg-black/30 border border-gray-600/50 text-white h-20 resize-none"
                          placeholder="Add any notes about your performance..."
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
          
          {workoutExercises.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Complete Workout
              </Button>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
