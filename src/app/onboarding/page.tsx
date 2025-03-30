'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dumbbell, Target, Calendar, Scale, Ruler, Brain } from 'lucide-react';

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];
const fitnessGoals = [
  'Build Muscle',
  'Lose Fat',
  'Increase Strength',
  'Improve Endurance',
  'Athletic Performance',
  'General Fitness',
];

const equipmentOptions = [
  'Full Gym Access',
  'Home Gym',
  'Minimal Equipment',
  'Bodyweight Only',
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    weight: '',
    height: '',
    fitnessLevel: '',
    fitnessGoals: [] as string[],
    workoutPreference: {
      daysPerWeek: 3,
      preferredDays: [] as string[],
      timePerWorkout: 60,
    },
    equipment: [] as string[],
    medicalConditions: '',
  });

  const handleGoalToggle = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal],
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setProfile(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      toast({
        title: 'Profile Saved',
        description: 'Your fitness profile has been created successfully!',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900 overflow-auto">
      <Header />
      <button 
        onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
        aria-label="Scroll to bottom"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <main className="container mx-auto px-4 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center">
            <Brain className="mr-3 text-cyan-400" />
            Let's Personalize Your AI Trainer
          </h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-cyan-300 flex items-center">
                  <Scale className="mr-2" /> Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-1">Age</label>
                    <Input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value || '' })}
                      className="bg-white/5 border-gray-600 text-white"
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Weight (kg)</label>
                    <Input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value || '' })}
                      className="bg-white/5 border-gray-600 text-white"
                      placeholder="Enter your weight"
                      min="1"
                      max="500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-1">Height (cm)</label>
                  <Input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value || '' })}
                    className="bg-white/5 border-gray-600 text-white"
                    placeholder="Enter your height"
                    min="1"
                    max="300"
                  />
                </div>
                <div className="sticky bottom-0 bg-gradient-to-t from-gray-900/95 to-gray-900/60 pt-3 pb-2 -mx-6 px-6 mt-4 z-10">
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Next: Fitness Goals →
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-cyan-300 flex items-center">
                  <Target className="mr-2" /> Your Fitness Goals
                </h2>
                <div>
                  <label className="block text-white mb-3">Fitness Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {fitnessLevels.map((level) => (
                      <Button
                        key={level}
                        onClick={() => setProfile({ ...profile, fitnessLevel: level })}
                        className={`${
                          profile.fitnessLevel === level
                            ? 'bg-cyan-500 hover:bg-cyan-600'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-3">Select Your Goals</label>
                  <div className="grid grid-cols-2 gap-3">
                    {fitnessGoals.map((goal) => (
                      <Button
                        key={goal}
                        onClick={() => handleGoalToggle(goal)}
                        className={`${
                          profile.fitnessGoals.includes(goal)
                            ? 'bg-cyan-500 hover:bg-cyan-600'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="sticky bottom-0 bg-gradient-to-t from-gray-900/95 to-gray-900/60 pt-3 pb-2 -mx-6 px-6 mt-4 z-10">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Next: Schedule →
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-cyan-300 flex items-center">
                  <Calendar className="mr-2" /> Workout Schedule
                </h2>
                <div>
                  <label className="block text-white mb-3">Days per Week</label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={profile.workoutPreference.daysPerWeek}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        workoutPreference: {
                          ...profile.workoutPreference,
                          daysPerWeek: e.target.value ? parseInt(e.target.value) : 3,
                        },
                      })
                    }
                    className="bg-white/5 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-3">Available Equipment</label>
                  <div className="grid grid-cols-2 gap-3">
                    {equipmentOptions.map((equipment) => (
                      <Button
                        key={equipment}
                        onClick={() => handleEquipmentToggle(equipment)}
                        className={`${
                          profile.equipment.includes(equipment)
                            ? 'bg-cyan-500 hover:bg-cyan-600'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {equipment}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-1">
                    Medical Conditions or Injuries (Optional)
                  </label>
                  <textarea
                    value={profile.medicalConditions}
                    onChange={(e) =>
                      setProfile({ ...profile, medicalConditions: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-white/5 border border-gray-600 text-white h-24 resize-none"
                    placeholder="List any medical conditions or injuries that might affect your training..."
                  />
                </div>
                <div className="sticky bottom-0 bg-gradient-to-t from-gray-900/95 to-gray-900/60 pt-3 pb-2 -mx-6 px-6 mt-4 z-10">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? 'Saving...' : 'Complete Setup ✓'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
