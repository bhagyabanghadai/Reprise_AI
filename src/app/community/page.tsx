'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, Award, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface Challenge {
  id: string
  name: string
  participants: number
  daysLeft: number
}

interface Discussion {
  id: string
  title: string
  replies: number
  lastActive: string
}

export default function Community() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challengesRes, discussionsRes] = await Promise.all([
          api.get('/challenges'),
          api.get('/discussions')
        ])
        setChallenges(challengesRes.data)
        setDiscussions(discussionsRes.data)
      } catch (error) {
        console.error('Failed to fetch community data:', error)
      }
    }
    fetchData()
  }, [])

  const joinChallenge = async (challengeId: string) => {
    try {
      await api.post(`/challenges/${challengeId}/join`, {})
      // Update the challenges state to reflect the join
      setChallenges(challenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, participants: challenge.participants + 1 }
          : challenge
      ))
    } catch (error) {
      console.error('Failed to join challenge:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-8 text-center text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Reprise Community
          </motion.h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <Award className="mr-2" /> Active Challenges
              </h2>
              <ul className="space-y-4">
                {challenges.map((challenge) => (
                  <li key={challenge.id} className="bg-white bg-opacity-5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">{challenge.name}</h3>
                    <p className="text-gray-300">
                      <Users className="inline mr-2" />
                      {challenge.participants} participants
                    </p>
                    <p className="text-gray-300">
                      {challenge.daysLeft} days left
                    </p>
                    <Button 
                      className="mt-2 bg-gradient-to-r from-cyan-500 to-teal-500"
                      onClick={() => joinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                <MessageSquare className="mr-2" /> Recent Discussions
              </h2>
              <ul className="space-y-4">
                {discussions.map((discussion) => (
                  <li key={discussion.id} className="bg-white bg-opacity-5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">{discussion.title}</h3>
                    <p className="text-gray-300">
                      {discussion.replies} replies • Last active {discussion.lastActive}
                    </p>
                    <Button variant="outline" className="mt-2 text-cyan-400 border-cyan-400">
                      Join Discussion
                    </Button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}