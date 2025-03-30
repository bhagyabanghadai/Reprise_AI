import { NextResponse, NextRequest } from 'next/server';

// Sample feedback data - in a real app, this would be generated dynamically
// based on user's workout history and goals
const sampleFeedback = [
  {
    type: 'insight',
    title: 'Progress Insight',
    message: 'Your bench press strength has increased by 12% this month. Consistency in upper body training is showing results.',
    icon: 'Sparkles',
    color: 'bg-purple-500'
  },
  {
    type: 'warning',
    title: 'Form Warning',
    message: 'Bar speed decreased in your last squat session. Consider reducing weight by 5-10% next workout or extending rest periods.',
    icon: 'AlertTriangle',
    color: 'bg-amber-500'
  },
  {
    type: 'achievement',
    title: 'Achievement Unlocked',
    message: 'New PR! You\'ve hit a personal record on deadlift at 315 lbs. Amazing progress!',
    icon: 'Award',
    color: 'bg-green-500'
  },
  {
    type: 'plan',
    title: 'Plan Adjustment',
    message: 'Added Romanian Deadlifts to address posterior chain weakness detected in your squat and deadlift patterns.',
    icon: 'TrendingUp',
    color: 'bg-blue-500'
  }
];

// Sample weekly plan data
const sampleWeeklyPlan = [
  { 
    day: 'Monday', 
    focus: 'Upper Body Strength', 
    exercises: [
      { name: 'Bench Press', sets: 5, reps: 5, weight: 185, notes: 'Focus on bar path and full ROM' },
      { name: 'Pull-ups', sets: 4, reps: 8, weight: 0, notes: 'Add weight if too easy' },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 105, notes: 'Slight increase from last week' }
    ],
    completed: false
  },
  { 
    day: 'Tuesday', 
    focus: 'Active Recovery', 
    exercises: [
      { name: 'Light Cycling', sets: 1, reps: 1, weight: 0, notes: '20 minutes steady state' },
      { name: 'Mobility Work', sets: 1, reps: 1, weight: 0, notes: 'Focus on hip and shoulder mobility' }
    ],
    completed: false
  },
  { 
    day: 'Wednesday', 
    focus: 'Lower Body Power', 
    exercises: [
      { name: 'Squat', sets: 4, reps: 6, weight: 275, notes: 'Focus on explosive concentric' },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 185, notes: 'Added to address posterior chain weakness' },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 360, notes: 'Moderate weight, focus on control' }
    ],
    completed: false
  },
  { 
    day: 'Thursday', 
    focus: 'Rest Day', 
    exercises: [],
    completed: false
  },
  { 
    day: 'Friday', 
    focus: 'Upper Body Hypertrophy', 
    exercises: [
      { name: 'Incline Bench Press', sets: 4, reps: 10, weight: 155, notes: 'Higher volume than Monday' },
      { name: 'Barbell Rows', sets: 4, reps: 10, weight: 165, notes: 'Focus on mid-back contraction' },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 20, notes: 'Added to address lagging shoulders' }
    ],
    completed: false
  },
  { 
    day: 'Saturday', 
    focus: 'Full Body Power', 
    exercises: [
      { name: 'Deadlift', sets: 5, reps: 3, weight: 315, notes: 'Test day - aiming for PR' },
      { name: 'Push Press', sets: 4, reps: 6, weight: 135, notes: 'Explosive movement' },
      { name: 'Pull-ups', sets: 3, reps: 10, weight: 0, notes: 'Volume focus' }
    ],
    completed: false
  },
  { 
    day: 'Sunday', 
    focus: 'Rest Day', 
    exercises: [],
    completed: false
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, we would fetch user-specific data
    // and generate insights based on their workout history, goals, etc.
    // For demonstration purposes, we'll return mock data

    // Simulate a small delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      insights: sampleFeedback,
      weeklyPlan: sampleWeeklyPlan
    });
  } catch (error) {
    console.error('Error generating coach insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate coach insights' },
      { status: 500 }
    );
  }
}