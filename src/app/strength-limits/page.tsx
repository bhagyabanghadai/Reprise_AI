'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Dumbbell, Save, Plus, Minus, BarChart3, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface StrengthLimit {
  exercise: string;
  oneRepMax: number;
  estimatedMax: boolean; // True if estimated, false if tested directly
  lastUpdated: string;
}

export default function StrengthLimitsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strengthLimits, setStrengthLimits] = useState<StrengthLimit[]>([]);
  
  // For demo purposes, we'll use user ID 1
  const userId = 'user-123';

  useEffect(() => {
    // Fetch strength limits
    async function fetchStrengthLimits() {
      try {
        const response = await fetch(`/api/strength-limits?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.strengthLimits) {
          // If we have limits in the database, use them
          if (Array.isArray(data.strengthLimits)) {
            setStrengthLimits(data.strengthLimits);
          } else {
            // Initialize with common exercises if no limits exist
            setStrengthLimits([
              { exercise: 'Bench Press', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
              { exercise: 'Squat', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
              { exercise: 'Deadlift', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
              { exercise: 'Overhead Press', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
            ]);
          }
        } else {
          // Initialize with common exercises if no limits exist
          setStrengthLimits([
            { exercise: 'Bench Press', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
            { exercise: 'Squat', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
            { exercise: 'Deadlift', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
            { exercise: 'Overhead Press', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch strength limits:', error);
        toast({
          title: 'Error',
          description: 'Failed to load strength limits. Please try again.',
          variant: 'destructive',
        });
        
        // Initialize with common exercises if error
        setStrengthLimits([
          { exercise: 'Bench Press', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
          { exercise: 'Squat', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
          { exercise: 'Deadlift', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
          { exercise: 'Overhead Press', oneRepMax: 0, estimatedMax: true, lastUpdated: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStrengthLimits();
  }, [userId, toast]);

  const addExercise = () => {
    setStrengthLimits([
      ...strengthLimits,
      {
        exercise: '',
        oneRepMax: 0,
        estimatedMax: true,
        lastUpdated: new Date().toISOString(),
      },
    ]);
  };

  const handleExerciseChange = (index: number, field: keyof StrengthLimit, value: any) => {
    const updatedLimits = [...strengthLimits];
    updatedLimits[index] = { ...updatedLimits[index], [field]: value };
    setStrengthLimits(updatedLimits);
  };

  const removeExercise = (index: number) => {
    const updatedLimits = [...strengthLimits];
    updatedLimits.splice(index, 1);
    setStrengthLimits(updatedLimits);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate data before saving
      for (const limit of strengthLimits) {
        if (!limit.exercise?.trim()) {
          toast({
            title: 'Invalid data',
            description: 'Exercise name cannot be empty.',
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }

      // Update lastUpdated for all exercises
      const updatedLimits = strengthLimits.map(limit => ({
        ...limit,
        lastUpdated: new Date().toISOString(),
      }));
      
      // Save to database
      const response = await fetch('/api/strength-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          strengthLimits: updatedLimits,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Strength limits saved successfully!',
        });
        router.push('/dashboard');
      } else {
        throw new Error(data.error || 'Failed to save strength limits');
      }
    } catch (error) {
      console.error('Failed to save strength limits:', error);
      toast({
        title: 'Error',
        description: 'Failed to save strength limits. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            onClick={handleSave}
            disabled={saving || strengthLimits.length === 0}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Limits
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Dumbbell className="mr-3 text-cyan-400" /> Strength Limits
          </h1>
          <p className="text-gray-300 mt-1">
            Enter your 1 rep max (1RM) for each exercise to personalize your workout recommendations
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-yellow-500 mr-2" />
            <span className="text-yellow-200 text-sm">
              Your 1RM will be used to calculate appropriate working weights for each exercise (typically 65-85% of 1RM).
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {strengthLimits.map((limit, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="md:w-1/3">
                  <label className="block text-gray-300 text-sm mb-1">Exercise</label>
                  <Input
                    type="text"
                    value={limit.exercise}
                    onChange={(e) => handleExerciseChange(index, 'exercise', e.target.value)}
                    className="bg-black/20 border-gray-700 text-white"
                    placeholder="e.g., Bench Press"
                  />
                </div>
                
                <div className="md:w-1/3">
                  <label className="block text-gray-300 text-sm mb-1">1 Rep Max (lbs)</label>
                  <div className="flex">
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300"
                      onClick={() => handleExerciseChange(index, 'oneRepMax', Math.max(0, limit.oneRepMax - 5))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={limit.oneRepMax}
                      onChange={(e) => handleExerciseChange(index, 'oneRepMax', Number(e.target.value))}
                      className="bg-black/20 border-gray-700 text-white text-center mx-2"
                      min="0"
                      step="5"
                    />
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300"
                      onClick={() => handleExerciseChange(index, 'oneRepMax', limit.oneRepMax + 5)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="md:w-1/4">
                  <label className="block text-gray-300 text-sm mb-1">Type</label>
                  <select
                    value={limit.estimatedMax ? 'estimated' : 'tested'}
                    onChange={(e) => handleExerciseChange(index, 'estimatedMax', e.target.value === 'estimated')}
                    className="w-full bg-black/20 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="tested">Tested 1RM</option>
                    <option value="estimated">Estimated 1RM</option>
                  </select>
                </div>
                
                <div className="md:w-auto flex items-end">
                  <Button
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={() => removeExercise(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <Button onClick={addExercise} className="bg-white/10 text-cyan-300 hover:bg-white/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        <div className="bg-black/30 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
            What are 1 Rep Maxes?
          </h2>
          <div className="space-y-3 text-gray-300">
            <p>
              Your 1 Rep Max (1RM) is the maximum amount of weight you can lift for one repetition of an exercise with proper form.
            </p>
            <p>
              <strong className="text-cyan-300">Tested 1RM:</strong> Weight you've actually lifted for 1 rep.
            </p>
            <p>
              <strong className="text-cyan-300">Estimated 1RM:</strong> Calculated based on weight you can lift for multiple reps.
              (Example: If you can lift 200 lbs for 5 reps, your estimated 1RM might be around 225 lbs)
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}