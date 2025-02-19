'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function WorkoutForm() {
  const [workout, setWorkout] = useState({ exercise: '', reps: '', sets: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(workout);
    // Handle the workout form submission
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg">
      <div className="mb-4">
        <label className="block text-white mb-1">Exercise</label>
        <Input
          type="text"
          value={workout.exercise}
          onChange={(e) => setWorkout({ ...workout, exercise: e.target.value })}
          placeholder="Exercise name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-1">Reps</label>
        <Input
          type="number"
          value={workout.reps}
          onChange={(e) => setWorkout({ ...workout, reps: e.target.value })}
          placeholder="Number of reps"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-1">Sets</label>
        <Input
          type="number"
          value={workout.sets}
          onChange={(e) => setWorkout({ ...workout, sets: e.target.value })}
          placeholder="Number of sets"
        />
      </div>
      <Button type="submit">Log Workout</Button>
    </form>
  );
}
