'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Settings, ArrowLeft, Save } from 'lucide-react';

interface FitnessGoals {
  primary: string;
  secondary: string[];
  targetWeight?: number;
  workoutsPerWeek: number;
}

interface ProfileData {
  age?: number;
  weight?: number;
  height?: number;
  fitnessLevel: string;
  fitnessGoals: FitnessGoals;
  equipment: string[];
  medicalConditions?: string[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    age: undefined,
    weight: undefined,
    height: undefined,
    fitnessLevel: 'beginner',
    fitnessGoals: {
      primary: 'strength',
      secondary: [],
      workoutsPerWeek: 3
    },
    equipment: [],
    medicalConditions: []
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user profile data if it exists
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, router]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalChange = (field: keyof FitnessGoals, value: any) => {
    setProfile(prev => ({
      ...prev,
      fitnessGoals: {
        ...prev.fitnessGoals,
        [field]: value
      }
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setProfile(prev => {
      const updatedEquipment = prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment];
      
      return {
        ...prev,
        equipment: updatedEquipment
      };
    });
  };

  const handleSecondaryGoalToggle = (goal: string) => {
    setProfile(prev => {
      const updatedGoals = prev.fitnessGoals.secondary.includes(goal)
        ? prev.fitnessGoals.secondary.filter(g => g !== goal)
        : [...prev.fitnessGoals.secondary, goal];
      
      return {
        ...prev,
        fitnessGoals: {
          ...prev.fitnessGoals,
          secondary: updatedGoals
        }
      };
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save your profile',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      toast({
        title: 'Success',
        description: 'Your profile has been saved successfully!',
      });
      
      // Redirect to dashboard after saving
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your profile. Please try again.',
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
            Save Profile
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
            <User className="mr-3 text-cyan-400" />
            Your Profile
          </h1>
          <p className="text-gray-300 mb-8">
            Tell us about yourself so we can personalize your fitness journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-white mb-2">Age</label>
              <Input
                type="number"
                value={profile.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                className="bg-white/5 border-gray-600 text-white"
                placeholder="Your age"
                min="16"
                max="100"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Weight (lbs)</label>
              <Input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                className="bg-white/5 border-gray-600 text-white"
                placeholder="Your weight"
                min="50"
                max="500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Height (cm)</label>
              <Input
                type="number"
                value={profile.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || undefined)}
                className="bg-white/5 border-gray-600 text-white"
                placeholder="Your height"
                min="100"
                max="250"
                step="0.1"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-white mb-2">Fitness Level</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`p-3 rounded-lg border transition ${
                    profile.fitnessLevel === level
                      ? 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50 border-cyan-400 text-white'
                      : 'bg-white/5 border-gray-600 text-gray-300'
                  }`}
                  onClick={() => handleInputChange('fitnessLevel', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-white mb-2">Primary Fitness Goal</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['strength', 'muscle gain', 'weight loss', 'endurance', 'overall fitness'].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={`p-3 rounded-lg border transition ${
                    profile.fitnessGoals.primary === goal
                      ? 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50 border-cyan-400 text-white'
                      : 'bg-white/5 border-gray-600 text-gray-300'
                  }`}
                  onClick={() => handleGoalChange('primary', goal)}
                >
                  {goal.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-white mb-2">Secondary Goals (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['flexibility', 'power', 'speed', 'muscle definition', 'stress reduction'].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={`p-3 rounded-lg border transition ${
                    profile.fitnessGoals.secondary.includes(goal)
                      ? 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50 border-cyan-400 text-white'
                      : 'bg-white/5 border-gray-600 text-gray-300'
                  }`}
                  onClick={() => handleSecondaryGoalToggle(goal)}
                >
                  {goal.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-white mb-2">Workouts Per Week</label>
            <Input
              type="number"
              value={profile.fitnessGoals.workoutsPerWeek}
              onChange={(e) => handleGoalChange('workoutsPerWeek', parseInt(e.target.value) || 3)}
              className="bg-white/5 border-gray-600 text-white max-w-xs"
              min="1"
              max="7"
            />
          </div>

          <div className="mb-8">
            <label className="block text-white mb-2">Available Equipment</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                'dumbbells', 'barbell', 'kettlebells', 'resistance bands', 
                'pull-up bar', 'bench', 'treadmill', 'bike', 
                'rowing machine', 'smith machine', 'cable machine', 'full gym'
              ].map((equipment) => (
                <button
                  key={equipment}
                  type="button"
                  className={`p-3 rounded-lg border transition ${
                    profile.equipment.includes(equipment)
                      ? 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50 border-cyan-400 text-white'
                      : 'bg-white/5 border-gray-600 text-gray-300'
                  }`}
                  onClick={() => handleEquipmentToggle(equipment)}
                >
                  {equipment.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Medical Conditions (Optional)</label>
            <textarea
              value={profile.medicalConditions?.join(', ') || ''}
              onChange={(e) => handleInputChange('medicalConditions', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
              className="w-full p-3 rounded-lg bg-white/5 border border-gray-600 text-white h-24 resize-none"
              placeholder="List any medical conditions or injuries we should know about (e.g., back pain, knee issues)"
            />
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}