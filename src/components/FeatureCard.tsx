import { motion } from 'framer-motion'

interface FeatureCardProps {
  title: string
  icon: string
  description: string
}

export default function FeatureCard({ title, icon, description }: FeatureCardProps) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-800 to-indigo-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-purple-700 hover:border-teal-400"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-teal-300">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}