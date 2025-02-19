'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroup: string;
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
  const { toast } = useToast();

  useEffect(() => {
    // Fetch available exercises
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        const data = await response.json();
        setExercises(data.exercises);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercises. Please try again.',
          variant: 'destructive'
        });
      }
    };

    fetchExercises();
  }, [toast]);

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

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg space-y-4">
      <div>
        <label className="block text-white mb-1">Exercise</label>
        <select
          value={workout.exerciseId}
          onChange={(e) => setWorkout({ ...workout, exerciseId: e.target.value })}
          className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white"
          required
        >
          <option value="">Select exercise</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
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
          <Input
            type="number"
            min="1"
            max="10"
            value={workout.rpe}
            onChange={(e) => setWorkout({ ...workout, rpe: e.target.value })}
            placeholder="Rate of Perceived Exertion"
            className="bg-white/5 border-gray-600 text-white"
          />
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