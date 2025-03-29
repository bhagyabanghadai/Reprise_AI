import { Dumbbell, BarChart3, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface StrengthLimit {
  exercise: string;
  oneRepMax: number;
  estimatedMax: boolean;
  lastUpdated: string;
}

interface StrengthLimitsCardProps {
  userId: string;
}

export default function StrengthLimitsCard({ userId }: StrengthLimitsCardProps) {
  const router = useRouter();
  const [strengthLimits, setStrengthLimits] = useState<StrengthLimit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStrengthLimits() {
      try {
        const response = await fetch(`/api/strength-limits?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.strengthLimits && Array.isArray(data.strengthLimits)) {
          setStrengthLimits(data.strengthLimits);
        }
      } catch (error) {
        console.error('Failed to fetch strength limits:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStrengthLimits();
  }, [userId]);

  return (
    <div className="bg-gradient-to-br from-indigo-900/70 to-indigo-800/70 backdrop-blur rounded-xl p-5 border border-indigo-700/50 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Strength Limits</h3>
      </div>
      
      <div className="flex-grow">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : strengthLimits.length === 0 ? (
          <div className="bg-indigo-800/50 rounded-lg p-5 mb-4 text-center">
            <p className="text-indigo-200 mb-4">
              Set your 1RM (one rep max) for your main lifts to get personalized workout recommendations
            </p>
            <Button 
              onClick={() => router.push('/strength-limits')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Set Strength Limits
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {strengthLimits.slice(0, 4).map((limit, index) => (
              <div key={index} className="flex justify-between items-center border-b border-indigo-700/50 pb-2">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-indigo-400 mr-2" />
                  <span className="text-white">{limit.exercise}</span>
                </div>
                <div className="text-indigo-200 font-medium">
                  {limit.oneRepMax} lbs
                  <span className="text-xs ml-1 text-indigo-300">
                    {limit.estimatedMax ? '(est)' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Button
        onClick={() => router.push('/strength-limits')}
        variant="ghost"
        className="w-full justify-between text-indigo-300 border border-indigo-700 hover:bg-indigo-800/50 mt-auto"
      >
        <span>Manage Strength Limits</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}