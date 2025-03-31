'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { Loader2, Search, Filter, X } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroup: string;
  category: string;
}

interface WorkoutFormProps {
  userId: string;
}

export default function WorkoutForm({ userId }: WorkoutFormProps) {
  const [workout, setWorkout] = useState({
    exerciseId: '',
    sets: '',
    reps: '',
    weight: '',
    rpe: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isExercisesLoading, setIsExercisesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsExercisesLoading(true);
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await response.json();
        console.log('Fetched exercises:', data); // Debug log
        setExercises(data.exercises || []);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercises. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsExercisesLoading(false);
      }
    };

    fetchExercises();
  }, [toast]);

  // Extract unique muscle groups and categories for filtering
  const muscleGroups = useMemo(() => {
    const groups = Array.from(new Set(exercises.map(ex => ex.muscleGroup)));
    return groups.sort();
  }, [exercises]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(exercises.map(ex => ex.category)));
    return cats.sort();
  }, [exercises]);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = searchTerm === '' || 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMuscleGroup = selectedMuscleGroup === '' || 
        exercise.muscleGroup === selectedMuscleGroup;
      
      const matchesCategory = selectedCategory === '' || 
        exercise.category === selectedCategory;
      
      return matchesSearch && matchesMuscleGroup && matchesCategory;
    });
  }, [exercises, searchTerm, selectedMuscleGroup, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...workout, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log workout');
      }

      toast({
        title: 'Success',
        description: 'Workout logged successfully!',
      });

      // Reset form
      setWorkout({
        exerciseId: '',
        sets: '',
        reps: '',
        weight: '',
        rpe: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMuscleGroup('');
    setSelectedCategory('');
  };

  if (isExercisesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-4">
        <h3 className="text-white text-lg font-semibold mb-3">Find Exercises</h3>
        
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-gray-600 text-white pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Muscle Group</label>
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white text-sm"
            >
              <option value="">All Muscle Groups</option>
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Reset filters button */}
        {(searchTerm || selectedMuscleGroup || selectedCategory) && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center text-sm text-gray-300 hover:text-white"
            >
              <X size={14} className="mr-1" /> Clear filters
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-white mb-1">Exercise</label>
        <select
          value={workout.exerciseId}
          onChange={(e) => setWorkout({ ...workout, exerciseId: e.target.value })}
          className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white"
          required
        >
          <option value="">Select exercise</option>
          {filteredExercises.length === 0 ? (
            <option value="" disabled>No matching exercises found</option>
          ) : (
            filteredExercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.muscleGroup})
              </option>
            ))
          )}
        </select>
        
        {workout.exerciseId && (
          <div className="mt-2 text-sm text-gray-300 bg-gray-800/30 p-2 rounded border border-gray-700">
            {exercises.find(ex => ex.id.toString() === workout.exerciseId)?.description}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-1">Sets</label>
          <Input
            type="number"
            min="1"
            value={workout.sets}
            onChange={(e) => setWorkout({ ...workout, sets: e.target.value })}
            placeholder="Number of sets"
            className="bg-white/5 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white mb-1">Reps</label>
          <Input
            type="number"
            min="1"
            value={workout.reps}
            onChange={(e) => setWorkout({ ...workout, reps: e.target.value })}
            placeholder="Reps per set"
            className="bg-white/5 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-1">Weight (lbs)</label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={workout.weight}
            onChange={(e) => setWorkout({ ...workout, weight: e.target.value })}
            placeholder="Weight used"
            className="bg-white/5 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white mb-1">RPE (1-10)</label>
          <div className="relative">
            <Input
              type="number"
              min="1"
              max="10"
              value={workout.rpe}
              onChange={(e) => setWorkout({ ...workout, rpe: e.target.value })}
              placeholder="Rate of Perceived Exertion"
              className="bg-white/5 border-gray-600 text-white"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-gray-400 hover:text-white cursor-help"
                title="RPE = Rate of Perceived Exertion. A scale from 1-10 indicating how difficult the set was. 10 = maximum effort (couldn't do one more rep)">
                ?
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-white mb-1">Notes</label>
        <textarea
          value={workout.notes}
          onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
          placeholder="Optional notes about your workout"
          className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white h-24 resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging workout...
          </>
        ) : (
          'Log Workout'
        )}
      </Button>
    </form>
  );
}