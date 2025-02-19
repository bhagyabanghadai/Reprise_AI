import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '../components/ui/button'
import { User } from 'lucide-react'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="py-4 px-6">
      <nav className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="Reprise" 
            width={32} 
            height={32} 
            className="text-[#00D1C7]"
          />
          <span className="text-2xl font-bold text-white">Reprise</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-white hover:text-[#00D1C7] transition">Features</Link>
          <Link href="/pricing" className="text-white hover:text-[#00D1C7] transition">Pricing</Link>
          <Link href="/about" className="text-white hover:text-[#00D1C7] transition">About</Link>
          <Link href="/community" className="text-white hover:text-[#00D1C7] transition">Community</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:text-[#00D1C7]"
                asChild
              >
                <Link href="/onboarding">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </Button>
              <Button className="bg-[#00D1C7] hover:bg-[#00B5AC] text-white">
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost">
                <Link href="/login" className="text-white">Log In</Link>
              </Button>
              <Button className="bg-[#00D1C7] hover:bg-[#00B5AC] text-white">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}