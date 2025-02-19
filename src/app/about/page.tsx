'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
      <motion.h1 
        className="text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About Reprise
      </motion.h1>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg shadow-lg p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-teal-300">Our Mission</h2>
          <p className="text-gray-300 mb-4">
            At Reprise, we're on a mission to revolutionize the fitness industry by harnessing the power of AI. We believe that everyone deserves access to personalized, effective workout plans and nutrition guidance, regardless of their experience level or location.
          </p>
          <p className="text-gray-300">
            Our AI-powered platform adapts to your unique needs, goals, and progress, providing you with a truly tailored fitness experience. We're not just building an app; we're creating a community of individuals committed to their health and wellness journey.
          </p>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg shadow-lg p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-teal-300">Our Team</h2>
          <p className="text-gray-300 mb-4">
            Reprise was founded by a diverse team of fitness enthusiasts, AI experts, and software engineers. We're united by our passion for technology and our belief in its power to transform lives.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="text-center">
              <Image src="/images/founder1.jpg" alt="Founder 1" width={150} height={150} className="rounded-full mx-auto mb-2" />
              <h3 className="font-semibold text-teal-300">Jane Doe</h3>
              <p className="text-gray-400">CEO & Co-founder</p>
            </div>
            <div className="text-center">
              <Image src="/images/founder2.jpg" alt="Founder 2" width={150} height={150} className="rounded-full mx-auto mb-2" />
              <h3 className="font-semibold text-teal-300">John Smith</h3>
              <p className="text-gray-400">CTO & Co-founder</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-teal-300">Our Vision</h2>
          <p className="text-gray-300">
            We envision a world where everyone has a personal AI fitness coach in their pocket. A world where technology breaks down the barriers to health and fitness, making it accessible and enjoyable for all. With Reprise, we're turning this vision into reality, one workout at a time.
          </p>
        </motion.div>
      </div>
    </div>
  )
}