import { motion } from 'framer-motion'
import Image from 'next/image'

interface TestimonialCardProps {
  name: string
  text: string
  avatar: string
}

export default function TestimonialCard({ name, text, avatar }: TestimonialCardProps) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-rose-800 to-pink-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-rose-700 hover:border-cyan-400"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center mb-4">
        <Image
          src={avatar}
          alt={name}
          width={50}
          height={50}
          className="rounded-full mr-4"
        />
        <h3 className="text-xl font-semibold text-cyan-300">{name}</h3>
      </div>
      <p className="text-gray-300 italic">"{text}"</p>
    </motion.div>
  )
}