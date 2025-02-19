'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  ArrowRight, Brain, Activity, Shield, 
  LineChart, Zap, Clock, Dumbbell, 
  Heart, Video, Trophy, Moon
} from 'lucide-react'
import { StaticImageData } from 'next/image'

interface Feature {
  title: string
  description: string
  image: string
  icon: React.ElementType
  highlights: string[]
  comingSoon?: boolean
}

const features: Feature[] = [
  { 
    title: 'Dynamic Progressive Overload AI',
    description: 'Experience the future of strength training with our AI that provides real-time weight progression suggestions based on your performance metrics, fatigue levels, and form quality.',
    image: '/images/progressive-overload.jpg',
    icon: LineChart,
    highlights: [
      'Real-time weight adjustment recommendations',
      'Speed and tempo analysis',
      'Fatigue-based progression modeling',
      'Performance trend analysis'
    ]
  },
  { 
    title: 'Injury Prevention System',
    description: 'Our advanced AI monitors your training patterns to predict and prevent potential injuries before they happen, keeping you safe and consistently progressing.',
    image: '/images/injury-prevention.jpg',
    icon: Shield,
    highlights: [
      'Risk factor analysis',
      'Preventive exercise recommendations',
      'Recovery protocol optimization',
      'Mobility work integration'
    ]
  },
  { 
    title: 'Smart Periodization',
    description: 'Let our AI design your perfect training cycles, from daily workouts to year-long programs, optimized for your competition schedule or strength goals.',
    image: '/images/periodization.jpg',
    icon: Clock,
    highlights: [
      'Competition-focused programming',
      'Adaptive microcycle planning',
      'Peak performance timing',
      'Deload optimization'
    ]
  },
  { 
    title: 'Recovery Intelligence',
    description: 'Advanced recovery monitoring and optimization using AI to analyze your training load, sleep quality, and physiological markers.',
    image: '/images/recovery.jpg',
    icon: Heart,
    highlights: [
      'HRV-based training adjustments',
      'Sleep quality analysis',
      'Active recovery recommendations',
      'Stress load management'
    ]
  },
  {
    title: 'AI Form Analysis',
    description: 'Real-time technique analysis and feedback using computer vision AI to perfect your lifting form and maximize efficiency.',
    image: '/images/form-analysis.jpg',
    icon: Video,
    highlights: [
      'Real-time form feedback',
      'Frame-by-frame analysis',
      'Technique improvement suggestions',
      'Progress tracking videos'
    ]
  },
  {
    title: 'Performance Optimization',
    description: 'Comprehensive analysis of your training, nutrition, and recovery data to maximize your strength gains and performance.',
    image: '/images/performance.jpg',
    icon: Zap,
    highlights: [
      'Nutrition timing optimization',
      'Sleep quality integration',
      'Warm-up protocol generation',
      'Equipment availability adaptation'
    ]
  },
  {
    title: 'Global Strength Community',
    description: 'Connect with fellow strength athletes worldwide, compete in AI-generated challenges, and track your progress on global leaderboards.',
    image: '/images/community.jpg',
    icon: Trophy,
    highlights: [
      'Global strength leaderboards',
      'AI-matched competitions',
      'Community challenges',
      'Progress sharing'
    ],
    comingSoon: true
  },
  {
    title: 'Smart Max Effort Prediction',
    description: 'AI-powered analysis to predict your readiness for max effort attempts and optimize your warm-up protocol.',
    image: '/images/max-effort.jpg',
    icon: Dumbbell,
    highlights: [
      '1RM prediction accuracy',
      'Personalized warm-up protocols',
      'Readiness assessment',
      'Attempt success prediction'
    ],
    comingSoon: true
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="pt-32 pb-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 text-transparent bg-clip-text">
            Advanced Strength Training AI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Experience the most advanced AI-powered strength training platform, designed specifically for serious athletes
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div 
                  key={feature.title}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-cyan-500/50 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative h-[240px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    {feature.comingSoon && (
                      <div className="absolute top-4 left-4 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
                        Coming Soon
                      </div>
                    )}
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index < 2}
                    />
                    <Icon className="absolute top-4 right-4 w-8 h-8 text-cyan-400 z-20" />
                  </div>
                  <div className="p-8 relative">
                    <h2 className="text-2xl font-bold mb-4 text-cyan-300 flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-400"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 