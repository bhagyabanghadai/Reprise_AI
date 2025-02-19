'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="flex-grow">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Revolutionize Your Fitness Journey
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Experience personalized AI-powered workouts tailored just for you.
              </p>
              <div className="space-x-4">
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-teal-600 transition duration-300 inline-block"
                >
                  Get Started
                </Link>
                <Link
                  href="/features"
                  className="text-white border-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-900 transition duration-300 inline-block"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="py-20 bg-white bg-opacity-10">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-12 text-center text-cyan-300"
            >
              Why Choose Reprise Fitness?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI-Powered Workouts',
                  description: 'Get personalized workout plans that adapt to your progress.',
                },
                {
                  title: 'Real-time Tracking',
                  description: 'Monitor your fitness journey with advanced analytics.',
                },
                {
                  title: 'Expert Guidance',
                  description: 'Receive tips and advice from our AI personal trainer.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white bg-opacity-5 p-6 rounded-lg"
                >
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}