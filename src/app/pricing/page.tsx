'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const plans = [
  {
    name: 'Basic',
    price: '$9.99',
    features: ['AI-generated workout plans', 'Progress tracking', 'Basic analytics', 'Community access'],
    color: 'from-blue-600 to-cyan-600',
    buttonColor: 'bg-white hover:bg-gray-100 text-blue-900'
  },
  {
    name: 'Pro',
    price: '$19.99',
    features: ['All Basic features', 'Advanced analytics', 'Nutrition guidance', 'Priority support', 'Exclusive content'],
    color: 'from-purple-600 to-pink-600',
    popular: true,
    buttonColor: 'bg-white hover:bg-gray-100 text-purple-900'
  },
  {
    name: 'Premium',
    price: '$29.99',
    features: ['All Pro features', 'Personal coach consultation', 'Custom workout videos', 'Wearable integration', 'VIP community access'],
    color: 'from-rose-600 to-orange-600',
    buttonColor: 'bg-white hover:bg-gray-100 text-rose-900'
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="pt-32 pb-20">
        <motion.h1 
          className="text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Choose Your Plan
        </motion.h1>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative bg-gradient-to-br ${plan.color} rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 text-sm font-semibold px-4 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-4 text-white">{plan.name}</h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-lg text-white/80">/month</span>
                  </div>
                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-white/90">
                        <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-3 rounded-xl font-semibold ${plan.buttonColor} border-2 border-transparent hover:border-white transition-all duration-300`}
                  >
                    Choose {plan.name}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}